"""
Disease information including descriptions, symptoms, causes, prevention, and treatment
"""

DISEASE_INFO = {
    "actinic keratosis": {
        "name": "Actinic Keratosis",
        "description": "Actinic keratosis (AK) is a rough, scaly patch on the skin that develops from years of sun exposure. It's considered a precancerous condition that can develop into squamous cell carcinoma if left untreated.",
        "symptoms": [
            "Rough, dry, or scaly patch of skin, usually less than 1 inch in diameter",
            "Flat to slightly raised patch or bump on the top layer of skin",
            "Color variations including pink, red, or brown",
            "Itching, burning, or bleeding",
            "New patches or bumps on sun-exposed areas"
        ],
        "causes": [
            "Frequent or intense sun exposure over many years",
            "Frequent use of tanning beds",
            "Fair skin, light hair, and light-colored eyes",
            "Age over 40",
            "Weakened immune system"
        ],
        "prevention": [
            "Limit sun exposure, especially between 10 a.m. and 2 p.m.",
            "Use broad-spectrum sunscreen with SPF 30 or higher daily",
            "Wear protective clothing including wide-brimmed hats",
            "Avoid tanning beds",
            "Examine your skin regularly and report changes to your doctor"
        ],
        "treatment": [
            "Cryotherapy (freezing with liquid nitrogen)",
            "Topical medications (5-fluorouracil, imiquimod, diclofenac)",
            "Photodynamic therapy",
            "Chemical peels",
            "Curettage (scraping)",
            "Laser therapy"
        ],
        "severity": "Low to Moderate",
        "requires_doctor": True,
        "urgency": "Schedule appointment within 2-4 weeks"
    },
    
    "basal cell carcinoma": {
        "name": "Basal Cell Carcinoma",
        "description": "Basal cell carcinoma (BCC) is the most common type of skin cancer. It begins in the basal cells of the skin and rarely spreads to other parts of the body, but can cause significant local damage if not treated.",
        "symptoms": [
            "Pearly or waxy bump on face, ears, or neck",
            "Flat, flesh-colored or brown scar-like lesion",
            "Bleeding or scabbing sore that heals and returns",
            "Pink growth with raised edges and indented center",
            "White, waxy, scar-like area without clear border"
        ],
        "causes": [
            "Long-term exposure to ultraviolet (UV) radiation from sunlight",
            "Tanning bed use",
            "Radiation therapy",
            "Fair skin and light hair",
            "Family history of skin cancer",
            "Weakened immune system"
        ],
        "prevention": [
            "Avoid sun exposure during peak hours (10 a.m. to 4 p.m.)",
            "Apply broad-spectrum sunscreen (SPF 30+) every 2 hours",
            "Wear protective clothing and wide-brimmed hats",
            "Avoid tanning beds completely",
            "Regular skin self-examinations",
            "Annual skin checks by a dermatologist"
        ],
        "treatment": [
            "Mohs surgery (most effective for facial lesions)",
            "Excisional surgery",
            "Curettage and electrodesiccation",
            "Cryotherapy for small lesions",
            "Topical medications (imiquimod, 5-fluorouracil)",
            "Radiation therapy in special cases"
        ],
        "severity": "Moderate to High",
        "requires_doctor": True,
        "urgency": "Schedule appointment within 1-2 weeks"
    },
    
    "dermatofibroma": {
        "name": "Dermatofibroma",
        "description": "Dermatofibroma is a common benign (non-cancerous) skin growth that appears as a small, firm bump. It's harmless but can be removed if it causes discomfort or cosmetic concerns.",
        "symptoms": [
            "Small, firm bump, usually less than 1 cm in diameter",
            "Color ranges from pink to brown or gray",
            "Dimples inward when pinched from the sides",
            "May be slightly itchy or tender",
            "Usually appears on legs, but can occur anywhere",
            "Grows slowly over time"
        ],
        "causes": [
            "Minor skin injuries (insect bites, splinters)",
            "Trauma to the skin",
            "Exact cause often unknown",
            "More common in women",
            "Can occur at any age, most common in adults"
        ],
        "prevention": [
            "No specific prevention methods",
            "Protect skin from injuries when possible",
            "Treat insect bites promptly",
            "Maintain good skin hygiene"
        ],
        "treatment": [
            "Usually no treatment needed (benign)",
            "Surgical excision if bothersome or for cosmetic reasons",
            "Cryotherapy (freezing)",
            "Laser treatment",
            "Steroid injections to flatten the bump",
            "Observation if asymptomatic"
        ],
        "severity": "Low (Benign)",
        "requires_doctor": False,
        "urgency": "Optional - only if causing discomfort"
    },
    
    "melanoma": {
        "name": "Melanoma",
        "description": "Melanoma is the most serious type of skin cancer. It develops in melanocytes (pigment-producing cells) and can spread to other parts of the body if not caught early. Early detection and treatment are critical.",
        "symptoms": [
            "New, unusual growth or change in existing mole",
            "Asymmetry: one half doesn't match the other",
            "Border irregularity: edges are ragged or notched",
            "Color variation: multiple colors or uneven distribution",
            "Diameter: larger than 6mm (pencil eraser)",
            "Evolving: changes in size, shape, or color",
            "Itching, tenderness, or bleeding"
        ],
        "causes": [
            "UV radiation exposure from sun or tanning beds",
            "History of sunburns, especially in childhood",
            "Many moles or atypical moles",
            "Fair skin, light hair, and light eyes",
            "Family history of melanoma",
            "Weakened immune system",
            "Age (risk increases with age)"
        ],
        "prevention": [
            "Avoid sun exposure during peak hours",
            "Use broad-spectrum sunscreen SPF 30+ daily",
            "Reapply sunscreen every 2 hours",
            "Wear protective clothing and sunglasses",
            "Never use tanning beds",
            "Perform monthly skin self-exams (ABCDE rule)",
            "Get annual professional skin exams",
            "Protect children from sun exposure"
        ],
        "treatment": [
            "Surgical excision (primary treatment)",
            "Sentinel lymph node biopsy",
            "Immunotherapy (pembrolizumab, nivolumab)",
            "Targeted therapy (BRAF/MEK inhibitors)",
            "Radiation therapy",
            "Chemotherapy (for advanced cases)",
            "Clinical trials for advanced melanoma"
        ],
        "severity": "High (Potentially Life-Threatening)",
        "requires_doctor": True,
        "urgency": "URGENT - Schedule appointment within 24-48 hours"
    },
    
    "nevus": {
        "name": "Nevus (Mole)",
        "description": "A nevus, commonly called a mole, is a benign growth of melanocytes (pigment cells). Most moles are harmless, but some can develop into melanoma. Regular monitoring is important.",
        "symptoms": [
            "Small, dark brown spot or bump",
            "Uniform color (brown, tan, black, pink, or skin-colored)",
            "Round or oval shape",
            "Flat or raised surface",
            "Usually less than 6mm in diameter",
            "Stable over time",
            "Can appear anywhere on the body"
        ],
        "causes": [
            "Genetic factors",
            "Sun exposure",
            "Present at birth (congenital) or develop over time",
            "Hormonal changes (puberty, pregnancy)",
            "Most people develop 10-40 moles by adulthood"
        ],
        "prevention": [
            "Limit sun exposure to prevent new moles",
            "Use sunscreen regularly",
            "Monitor existing moles for changes",
            "Avoid tanning beds",
            "Protect skin during childhood"
        ],
        "treatment": [
            "Usually no treatment needed",
            "Surgical removal if atypical or changing",
            "Removal for cosmetic reasons",
            "Biopsy if suspicious features present",
            "Regular monitoring with photos",
            "Dermoscopy examination by specialist"
        ],
        "severity": "Low (Usually Benign)",
        "requires_doctor": False,
        "urgency": "Monitor regularly; see doctor if changes occur"
    },
    
    "normal_skin": {
        "name": "Normal Skin",
        "description": "Normal, healthy skin with no visible abnormalities or lesions. The skin appears uniform in color and texture without any concerning features.",
        "symptoms": [
            "Uniform skin color and texture",
            "No visible lesions or growths",
            "No unusual discoloration",
            "No pain, itching, or irritation",
            "Healthy appearance"
        ],
        "causes": [
            "Healthy skin condition",
            "No disease present",
            "Good skin care routine",
            "Adequate sun protection"
        ],
        "prevention": [
            "Continue regular skin monitoring",
            "Use sunscreen daily (SPF 30+)",
            "Maintain healthy lifestyle",
            "Stay hydrated",
            "Perform monthly self-examinations"
        ],
        "treatment": [
            "No treatment needed",
            "Continue preventive care",
            "Regular skin checks",
            "Maintain good skincare routine"
        ],
        "severity": "None (Healthy)",
        "requires_doctor": False,
        "urgency": "No medical attention needed - Continue routine skin monitoring"
    },
    
    "pigmented benign keratosis": {
        "name": "Pigmented Benign Keratosis",
        "description": "Pigmented benign keratosis, also known as seborrheic keratosis, is a common non-cancerous skin growth. It appears as a brown, black, or tan growth and is often mistaken for a mole or wart.",
        "symptoms": [
            "Waxy, scaly, slightly raised growth",
            "Color ranges from light tan to black",
            "Appears 'stuck on' to the skin",
            "Round or oval shape",
            "May have a rough or warty surface",
            "Usually painless but may itch",
            "Multiple growths often appear"
        ],
        "causes": [
            "Age (more common after age 50)",
            "Genetic predisposition",
            "Sun exposure may play a role",
            "Exact cause unknown",
            "Not contagious or cancerous"
        ],
        "prevention": [
            "No proven prevention methods",
            "Sun protection may help reduce risk",
            "Regular skin monitoring",
            "Maintain healthy skin care routine"
        ],
        "treatment": [
            "No treatment necessary (benign)",
            "Cryotherapy (freezing) for removal",
            "Curettage (scraping off)",
            "Electrocautery (burning)",
            "Laser treatment",
            "Shave excision for cosmetic reasons"
        ],
        "severity": "Low (Benign)",
        "requires_doctor": False,
        "urgency": "Optional - only for cosmetic concerns or if irritated"
    },
    
    "seborrheic keratosis": {
        "name": "Seborrheic Keratosis",
        "description": "Seborrheic keratosis is one of the most common benign skin growths in older adults. These growths are harmless and don't require treatment unless they become irritated or for cosmetic reasons.",
        "symptoms": [
            "Waxy, scaly, raised growth",
            "Appears 'pasted on' the skin",
            "Color varies: tan, brown, or black",
            "Round or oval shape",
            "Slightly elevated with a rough surface",
            "May have a 'warty' appearance",
            "Can appear anywhere except palms and soles"
        ],
        "causes": [
            "Aging (very common after age 50)",
            "Genetic factors",
            "Possible link to sun exposure",
            "Not caused by viruses or infections",
            "Not contagious"
        ],
        "prevention": [
            "No specific prevention available",
            "Sun protection may help",
            "Regular skin examinations",
            "Healthy lifestyle and skin care"
        ],
        "treatment": [
            "No treatment needed (benign)",
            "Cryosurgery (liquid nitrogen freezing)",
            "Curettage (scraping)",
            "Electrocautery or laser ablation",
            "Shave excision",
            "Removal only if irritated, bleeding, or cosmetic concern"
        ],
        "severity": "Low (Benign)",
        "requires_doctor": False,
        "urgency": "Optional - consult if concerned or for removal"
    },
    
    "squamous cell carcinoma": {
        "name": "Squamous Cell Carcinoma",
        "description": "Squamous cell carcinoma (SCC) is the second most common type of skin cancer. It develops in the squamous cells of the skin and can spread to other parts of the body if not treated, though this is uncommon.",
        "symptoms": [
            "Firm, red nodule",
            "Flat lesion with a scaly, crusted surface",
            "New sore or raised area on an old scar",
            "Rough, scaly patch that may bleed",
            "Wart-like growth",
            "Open sore that doesn't heal",
            "Raised growth with a central depression"
        ],
        "causes": [
            "Cumulative sun exposure over time",
            "Tanning bed use",
            "Fair skin, light hair, and light eyes",
            "History of sunburns",
            "Actinic keratosis (precancerous condition)",
            "Weakened immune system",
            "Exposure to certain chemicals (arsenic, coal tar)",
            "Radiation therapy",
            "Chronic skin inflammation or scars"
        ],
        "prevention": [
            "Avoid sun during peak hours (10 a.m. to 4 p.m.)",
            "Apply broad-spectrum sunscreen SPF 30+ daily",
            "Wear protective clothing and wide-brimmed hats",
            "Avoid tanning beds completely",
            "Treat actinic keratosis promptly",
            "Regular skin self-examinations",
            "Annual dermatologist visits",
            "Protect scars from sun exposure"
        ],
        "treatment": [
            "Surgical excision (most common)",
            "Mohs micrographic surgery",
            "Curettage and electrodesiccation",
            "Cryotherapy for small, superficial lesions",
            "Radiation therapy",
            "Topical medications (5-fluorouracil, imiquimod)",
            "Photodynamic therapy",
            "Systemic therapy for advanced cases"
        ],
        "severity": "Moderate to High",
        "requires_doctor": True,
        "urgency": "Schedule appointment within 1-2 weeks"
    },
    
    "vascular lesion": {
        "name": "Vascular Lesion",
        "description": "Vascular lesions are abnormalities of blood vessels in the skin. They can be birthmarks or develop later in life. Most are benign, but some may require treatment for cosmetic reasons or if they cause symptoms.",
        "symptoms": [
            "Red, purple, or pink discoloration of skin",
            "Flat or raised appearance",
            "May blanch (turn white) when pressed",
            "Can vary in size from small spots to large patches",
            "May be present at birth or develop over time",
            "Usually painless",
            "Examples: hemangiomas, port-wine stains, cherry angiomas"
        ],
        "causes": [
            "Abnormal development of blood vessels",
            "Genetic factors",
            "Congenital (present at birth)",
            "Aging (cherry angiomas)",
            "Hormonal changes",
            "Sun exposure",
            "Trauma to the skin"
        ],
        "prevention": [
            "No prevention for congenital lesions",
            "Sun protection may prevent some acquired lesions",
            "Avoid trauma to skin",
            "Maintain healthy lifestyle"
        ],
        "treatment": [
            "Observation (many are harmless)",
            "Laser therapy (pulsed dye laser)",
            "Sclerotherapy (injection therapy)",
            "Surgical excision",
            "Electrocautery",
            "Topical medications (beta-blockers for infantile hemangiomas)",
            "Treatment depends on type, size, and location"
        ],
        "severity": "Low to Moderate (Usually Benign)",
        "requires_doctor": False,
        "urgency": "Optional - consult if growing, bleeding, or causing concern"
    }
}

def get_disease_info(disease_name):
    """Get information for a specific disease"""
    disease_key = disease_name.lower()
    return DISEASE_INFO.get(disease_key, None)

def get_all_diseases():
    """Get list of all diseases"""
    return list(DISEASE_INFO.keys())

def format_disease_info(disease_name):
    """Format disease information for display"""
    info = get_disease_info(disease_name)
    if not info:
        return "Disease information not available."
    
    formatted = f"""
{'='*60}
{info['name'].upper()}
{'='*60}

DESCRIPTION:
{info['description']}

SYMPTOMS:
"""
    for symptom in info['symptoms']:
        formatted += f"  • {symptom}\n"
    
    formatted += f"\nCAUSES:\n"
    for cause in info['causes']:
        formatted += f"  • {cause}\n"
    
    formatted += f"\nPREVENTION:\n"
    for prevention in info['prevention']:
        formatted += f"  • {prevention}\n"
    
    formatted += f"\nTREATMENT OPTIONS:\n"
    for treatment in info['treatment']:
        formatted += f"  • {treatment}\n"
    
    formatted += f"""
{'='*60}
SEVERITY: {info['severity']}
REQUIRES DOCTOR: {'Yes' if info['requires_doctor'] else 'No'}
URGENCY: {info['urgency']}
{'='*60}
"""
    return formatted

if __name__ == "__main__":
    # Test the disease info
    for disease in get_all_diseases():
        print(format_disease_info(disease))
        print("\n\n")
