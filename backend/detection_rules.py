"""
Cryptographic detection rules for the Python AST scanner.

Each entry describes:
    module -> function -> algorithm name

The scanner uses these rules after parsing Python source code with AST.
"""

DETECTION_RULES = {
    "hashlib": {
        "md5": "MD5",
        "sha1": "SHA-1",
        "sha256": "SHA-256",
        "sha384": "SHA-384",
        "sha512": "SHA-512",
    },

    # PyCryptodome
    "Crypto.Cipher": {
        "AES": "AES",
        "DES": "DES",
        "DES3": "3DES",
        "Blowfish": "Blowfish",
        "ARC4": "ARC4",
    },

    "Crypto.PublicKey": {
        "RSA": "RSA",
        "DSA": "DSA",
        "ECC": "ECC",
    },

    "Crypto.Hash": {
        "MD5": "MD5",
        "SHA1": "SHA-1",
        "SHA256": "SHA-256",
        "SHA384": "SHA-384",
        "SHA512": "SHA-512",
    },
}