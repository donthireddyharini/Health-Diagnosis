import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'  # Reduce TensorFlow logging

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import EfficientNetB0, ResNet50
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau
import numpy as np
import matplotlib.pyplot as plt

# Configuration
IMG_SIZE = 224
BATCH_SIZE = 16  # Reduced for smaller dataset
EPOCHS = 50  # Increased for better training
NUM_CLASSES = 10  # Updated to include normal_skin class

# Dataset paths
TRAIN_DIR = r'Skin cancer ISIC The International Skin Imaging Collaboration\Train'
TEST_DIR = r'Skin cancer ISIC The International Skin Imaging Collaboration\Test'

# Class names
CLASS_NAMES = [
    'actinic keratosis',
    'basal cell carcinoma',
    'dermatofibroma',
    'melanoma',
    'nevus',
    'normal_skin',
    'pigmented benign keratosis',
    'seborrheic keratosis',
    'squamous cell carcinoma',
    'vascular lesion'
]

def create_data_generators():
    """Create data generators with augmentation for training"""
    
    # Training data augmentation
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=40,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        vertical_flip=True,
        fill_mode='nearest',
        validation_split=0.2
    )
    
    # Test data - only rescaling
    test_datagen = ImageDataGenerator(rescale=1./255)
    
    # Create generators
    train_generator = train_datagen.flow_from_directory(
        TRAIN_DIR,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='training',
        shuffle=True
    )
    
    validation_generator = train_datagen.flow_from_directory(
        TRAIN_DIR,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='validation',
        shuffle=False
    )
    
    test_generator = test_datagen.flow_from_directory(
        TEST_DIR,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        shuffle=False
    )
    
    return train_generator, validation_generator, test_generator

def create_model():
    """Create model using ResNet50 with transfer learning"""
    
    print("  Building model with ResNet50 (Transfer Learning)...")
    
    # Load pre-trained ResNet50
    base_model = ResNet50(
        include_top=False,
        weights='imagenet',
        input_shape=(IMG_SIZE, IMG_SIZE, 3)
    )
    
    # Freeze base model initially
    base_model.trainable = False
    
    # Create new model on top
    model = keras.Sequential([
        base_model,
        layers.GlobalAveragePooling2D(),
        layers.BatchNormalization(),
        layers.Dropout(0.5),
        layers.Dense(512, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.3),
        layers.Dense(256, activation='relu'),
        layers.Dropout(0.2),
        layers.Dense(NUM_CLASSES, activation='softmax')
    ])
    
    return model, base_model

def compile_and_train(model, train_gen, val_gen, initial_epochs=25):
    """Compile and train the model"""
    
    # Compile model
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.001),
        loss='categorical_crossentropy',
        metrics=['accuracy', keras.metrics.AUC(name='auc'), 
                keras.metrics.Precision(name='precision'),
                keras.metrics.Recall(name='recall')]
    )
    
    # Callbacks
    callbacks = [
        ModelCheckpoint(
            'models/skin_disease_model_best.keras',
            monitor='val_accuracy',
            save_best_only=True,
            mode='max',
            verbose=1
        ),
        EarlyStopping(
            monitor='val_loss',
            patience=10,
            restore_best_weights=True,
            verbose=1
        ),
        ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=5,
            min_lr=1e-7,
            verbose=1
        )
    ]
    
    # Create models directory
    os.makedirs('models', exist_ok=True)
    
    # Train model
    print("Starting initial training...")
    history = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=initial_epochs,
        callbacks=callbacks,
        verbose=1
    )
    
    return history

def fine_tune_model(model, base_model, train_gen, val_gen, fine_tune_epochs=25):
    """Continue training with lower learning rate and unfrozen base model"""
    
    # Unfreeze the base model for fine-tuning
    if base_model is not None:
        base_model.trainable = True
        print(f"  Unfreezing base model layers...")
    
    # Recompile with lower learning rate
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.0001),
        loss='categorical_crossentropy',
        metrics=['accuracy', keras.metrics.AUC(name='auc'),
                keras.metrics.Precision(name='precision'),
                keras.metrics.Recall(name='recall')]
    )
    
    # Callbacks
    callbacks = [
        ModelCheckpoint(
            'models/skin_disease_model_finetuned.keras',
            monitor='val_accuracy',
            save_best_only=True,
            mode='max',
            verbose=1
        ),
        EarlyStopping(
            monitor='val_loss',
            patience=10,
            restore_best_weights=True,
            verbose=1
        ),
        ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=5,
            min_lr=1e-8,
            verbose=1
        )
    ]
    
    print("\nContinuing training with lower learning rate...")
    history_fine = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=fine_tune_epochs,
        callbacks=callbacks,
        verbose=1
    )
    
    return history_fine

def evaluate_model(model, test_gen):
    """Evaluate the model on test data"""
    
    print("\nEvaluating model on test data...")
    results = model.evaluate(test_gen, verbose=1)
    
    print("\n" + "="*50)
    print("TEST RESULTS")
    print("="*50)
    print(f"Test Loss: {results[0]:.4f}")
    print(f"Test Accuracy: {results[1]:.4f}")
    print(f"Test AUC: {results[2]:.4f}")
    print(f"Test Precision: {results[3]:.4f}")
    print(f"Test Recall: {results[4]:.4f}")
    print("="*50)
    
    return results

def plot_training_history(history, history_fine=None):
    """Plot training history"""
    
    fig, axes = plt.subplots(2, 2, figsize=(15, 10))
    
    # Accuracy
    axes[0, 0].plot(history.history['accuracy'], label='Train Accuracy')
    axes[0, 0].plot(history.history['val_accuracy'], label='Val Accuracy')
    if history_fine:
        offset = len(history.history['accuracy'])
        axes[0, 0].plot(range(offset, offset + len(history_fine.history['accuracy'])), 
                       history_fine.history['accuracy'], label='Train Accuracy (Fine-tune)')
        axes[0, 0].plot(range(offset, offset + len(history_fine.history['val_accuracy'])), 
                       history_fine.history['val_accuracy'], label='Val Accuracy (Fine-tune)')
    axes[0, 0].set_title('Model Accuracy')
    axes[0, 0].set_xlabel('Epoch')
    axes[0, 0].set_ylabel('Accuracy')
    axes[0, 0].legend()
    axes[0, 0].grid(True)
    
    # Loss
    axes[0, 1].plot(history.history['loss'], label='Train Loss')
    axes[0, 1].plot(history.history['val_loss'], label='Val Loss')
    if history_fine:
        offset = len(history.history['loss'])
        axes[0, 1].plot(range(offset, offset + len(history_fine.history['loss'])), 
                       history_fine.history['loss'], label='Train Loss (Fine-tune)')
        axes[0, 1].plot(range(offset, offset + len(history_fine.history['val_loss'])), 
                       history_fine.history['val_loss'], label='Val Loss (Fine-tune)')
    axes[0, 1].set_title('Model Loss')
    axes[0, 1].set_xlabel('Epoch')
    axes[0, 1].set_ylabel('Loss')
    axes[0, 1].legend()
    axes[0, 1].grid(True)
    
    # AUC
    axes[1, 0].plot(history.history['auc'], label='Train AUC')
    axes[1, 0].plot(history.history['val_auc'], label='Val AUC')
    if history_fine:
        offset = len(history.history['auc'])
        axes[1, 0].plot(range(offset, offset + len(history_fine.history['auc'])), 
                       history_fine.history['auc'], label='Train AUC (Fine-tune)')
        axes[1, 0].plot(range(offset, offset + len(history_fine.history['val_auc'])), 
                       history_fine.history['val_auc'], label='Val AUC (Fine-tune)')
    axes[1, 0].set_title('Model AUC')
    axes[1, 0].set_xlabel('Epoch')
    axes[1, 0].set_ylabel('AUC')
    axes[1, 0].legend()
    axes[1, 0].grid(True)
    
    # Precision & Recall
    axes[1, 1].plot(history.history['precision'], label='Train Precision')
    axes[1, 1].plot(history.history['recall'], label='Train Recall')
    if history_fine:
        offset = len(history.history['precision'])
        axes[1, 1].plot(range(offset, offset + len(history_fine.history['precision'])), 
                       history_fine.history['precision'], label='Train Precision (Fine-tune)')
        axes[1, 1].plot(range(offset, offset + len(history_fine.history['recall'])), 
                       history_fine.history['recall'], label='Train Recall (Fine-tune)')
    axes[1, 1].set_title('Precision & Recall')
    axes[1, 1].set_xlabel('Epoch')
    axes[1, 1].set_ylabel('Score')
    axes[1, 1].legend()
    axes[1, 1].grid(True)
    
    plt.tight_layout()
    plt.savefig('models/training_history.png', dpi=300, bbox_inches='tight')
    print("\nTraining history plot saved to 'models/training_history.png'")
    plt.show()

def save_class_indices(train_gen):
    """Save class indices for later use"""
    import json
    
    class_indices = train_gen.class_indices
    # Reverse the dictionary to get index -> class name mapping
    index_to_class = {v: k for k, v in class_indices.items()}
    
    with open('models/class_indices.json', 'w') as f:
        json.dump(index_to_class, f, indent=4)
    
    print("\nClass indices saved to 'models/class_indices.json'")
    print("Class mapping:")
    for idx, class_name in sorted(index_to_class.items()):
        print(f"  {idx}: {class_name}")

def main():
    """Main training pipeline"""
    
    print("="*50)
    print("SKIN DISEASE DETECTION - MODEL TRAINING")
    print("="*50)
    
    # Set random seeds for reproducibility
    np.random.seed(42)
    tf.random.set_seed(42)
    
    # Create data generators
    print("\n1. Creating data generators...")
    train_gen, val_gen, test_gen = create_data_generators()
    
    print(f"\nDataset Information:")
    print(f"  Training samples: {train_gen.samples}")
    print(f"  Validation samples: {val_gen.samples}")
    print(f"  Test samples: {test_gen.samples}")
    print(f"  Number of classes: {NUM_CLASSES}")
    
    # Save class indices
    save_class_indices(train_gen)
    
    # Create model
    print("\n2. Creating model...")
    model, base_model = create_model()
    print(f"  Total parameters: {model.count_params():,}")
    
    # Initial training
    print("\n3. Training model (Phase 1 - Initial Training)...")
    history = compile_and_train(model, train_gen, val_gen, initial_epochs=25)
    
    # Fine-tuning
    print("\n4. Fine-tuning model (Phase 2 - Lower Learning Rate)...")
    history_fine = fine_tune_model(model, base_model, train_gen, val_gen, fine_tune_epochs=25)
    
    # Evaluate on test set
    print("\n5. Evaluating model...")
    test_results = evaluate_model(model, test_gen)
    
    # Save final model
    print("\n6. Saving final model...")
    model.save('models/skin_disease_model_final.keras')
    print("  Model saved to 'models/skin_disease_model_final.keras'")
    
    # Plot training history
    print("\n7. Plotting training history...")
    plot_training_history(history, history_fine)
    
    print("\n" + "="*50)
    print("TRAINING COMPLETE!")
    print("="*50)
    print("\nModel files created:")
    print("  - models/skin_disease_model_final.h5 (Final model)")
    print("  - models/skin_disease_model_best.h5 (Best checkpoint)")
    print("  - models/skin_disease_model_finetuned.h5 (Best fine-tuned)")
    print("  - models/skin_disease_model_saved/ (Production format)")
    print("  - models/class_indices.json (Class mapping)")
    print("  - models/training_history.png (Training plots)")

if __name__ == "__main__":
    main()
