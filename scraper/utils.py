import re

def clean_currency(currency_str):
    """
    Removes currency symbols (₹, Rs, etc.), commas, and returns an integer.
    Example: '₹ 3,40,00,000' -> 340000000
    """
    if not currency_str or not isinstance(currency_str, str):
        return 0
    
    # Remove all non-numeric characters except for leading Minus sign if needed (though assets are usually positive)
    # Actually, the user specifically mentioned removing ₹ and commas.
    # Some assets might have 'Nil' or 'NA'
    if 'Nil' in currency_str or 'N/A' in currency_str.upper():
        return 0
        
    cleaned = re.sub(r'[^\d]', '', currency_str)
    try:
        return int(cleaned) if cleaned else 0
    except ValueError:
        return 0

def clean_integer(int_str):
    """
    Cleans integer strings.
    """
    if not int_str or not isinstance(int_str, str):
        return 0
    cleaned = re.sub(r'[^\d]', '', int_str)
    try:
        return int(cleaned) if cleaned else 0
    except ValueError:
        return 0
