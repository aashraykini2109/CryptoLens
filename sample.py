import hashlib
from Crypto.Cipher import AES, DES
from Crypto.PublicKey import RSA

password = "hello"

md5_hash = hashlib.md5(password.encode()).hexdigest()
sha1_hash = hashlib.sha1(password.encode()).hexdigest()
sha256_hash = hashlib.sha256(password.encode()).hexdigest()

aes_cipher = AES.new(key)
des_cipher = DES.new(key)
rsa_key = RSA.generate(2048)