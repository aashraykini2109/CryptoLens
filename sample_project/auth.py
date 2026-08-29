import hashlib

password = "hello"
hashed = hashlib.md5(password.encode()).hexdigest()