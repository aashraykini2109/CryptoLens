import hashlib

# hashlib.md5 is an old algorithm

password = "hello"

hashed = hashlib.md5(password.encode()).hexdigest()

text = "hashlib.sha1"