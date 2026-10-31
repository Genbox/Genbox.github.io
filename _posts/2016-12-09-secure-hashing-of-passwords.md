---
title: "Secure hashing of passwords"
description: "Explaining password-cracking costs, cryptographic hashes, salts, and deliberately slow password hashing."
date: "2016-12-09T16:35:00Z"
last_modified_at: "2016-12-18T01:34:32.413Z"
permalink: "/2016/12/secure-hashing-of-passwords.html"
tags: ["Security"]
---

Numerous breaches happen every day due to security vulnerabilities. On this blog, I have previously
analyzed some of the biggest breaches that have been made public. All of them serve as a testament
to the inadequate security many companies employ.

## The Time it Takes to Crack a Hash

I often get asked: "How long does it take to crack an MD5 hash?" - implying that the cryptographic
hash algorithm is the most important factor, which rarely is the case. It actually depends on a
couple of factors, which I've ordered in descending importance below:

1. The length of the password
2. The charsets used in the password
3. The amount of hardware you have
4. The methodology you use for cracking

### Secure Passwords

Password lengths alone are not enough, you also have to use a good charset to control the search
space hackers have to go through. Let's make an example to show how much the search space changes:

Charset = a-z, A-Z, 0-9  
Length 6: (26+26+10)^6 = 56.800.235.584  
Length 7: (26+26+10)^7 = 3.521.614.606.208  
Length 8: (26+26+10)^8 = 218.340.105.584.896

As you can see, the number gets a lot bigger for each character we add. Now let’s look at charsets:

Length = 8  
Charset: a-z = (26)^8 = 208.827.064.576  
Charset: a-z, A-Z = (26+26)^8 = 53.459.728.531.456  
Charset: a-z, A-Z, 0-9 = (26+26+10)^8 = 218.340.105.584.896

Charsets are at least as important as the length is. In reality, we need to increase both in order
to get good passwords. For reference, MD5 hashes on a Nvidia Titan X graphics card can be cracked
with around 15.000.000.000 hashes per second. A password of a-z, A-Z, 0-9 of length 8 would take
(26+26+10)^8 / 15.000.000.000 = 14556 seconds (about 4 hours). That is not long enough to deter
hackers - we need to do something about the hashing algorithm as well.

## The Cryptographic Hash Algorithms

Through time, developers have used many different cryptographic hash algorithms to store passwords.
Actually, most systems still use rather weak hash algorithms, which is why this blog post even
exists. If we take a look at the hashing algorithms from strong to weak:

1. scrypt, bcrypt, PBKDF2
2. SHA512, SHA256
3. SHA1, MD5
4. NTLM, MD4
5. LM, DES (unix crypt)

I could write 100 blog posts about each algorithm, but suffice to say that LM and DES used to be
VERY widespread in the days of Windows XP and Linux 2.x. They have since moved on to stronger
algorithms, but Windows is stuck on NTLM, and Linux still uses MD5, SHA256 and SHA512 for the most
part, but is transitioning nicely to scrypt and PBKDF2.

You might be wondering what the speeds are of each algorithm, so I'll include each of them here. A
larger number of hashes is worse. The speeds are from a Nvidia Geforce 1080 graphics card with
Hashcat:

1. scrypt - 434.000 H/s
2. bcrypt - 13.226 H/s
3. PBKDF2 (SHA1) - 3218.000 H/s
4. SHA512 - 1.021.000.000 H/s
5. SHA256 - 2.829.000.000 H/s
6. SHA1 - 8.491.000.000 H/s
7. MD5 - 24.809.000.000 H/s
8. NTLM - 41.354.000.000 H/s
9. MD4 - 43.145.000.000 H/s
10. LM - 18.429.000.000 H/s
11. DES - 909.000.000 H/s

You might say: Hold on a minute! DES is actually slower than SHA512, does that not mean it is more
secure?

Nope! That's because the way the Linux guys implemented DES limited it to a maximum of 8 characters,
and they are also using the 2 first characters as salt, which means we only need to crack 6
character long passwords. LM hashes are also limited to 14 characters, but the way Microsoft made
the algorithm is flawed, and as such, we only need to crack 2x7 character passwords.

## The Salted Hash

Password salts are needed in order to protect against [rainbow table
attacks](/2012/01/the-power-of-rainbow-tables.html). Hackers have access to large precomputed tables
of character sets in many different cryptographic hash algorithms today, and when they target just a
single hash, it can be quite effective.

The salt is just a binary blob that gets appended to the password in the hashing process. A password
of '123456' becomes '123456\[SaltHere\]', thereby making it impossible to precompute a table that
contains '123456\[SaltHere\]'. Salts should be unique for each user in the database, thereby making
the protection even more effective.

The right way to salt the password is to use a cryptographically secure pseudo-random number
generator
([CSPRNG](https://en.wikipedia.org/wiki/Cryptographically_secure_pseudorandom_number_generator)) to
create a salt which is unique for each user. It needs to be at least 64 bits (8 bytes) to be
effective. The salt is stored together with the hash inside the user database in plain text.

## The Slow Hash

Cryptographic hash functions like MD5 and SHA1 are designed with high performance in mind. This
means that they can quickly produce a hash of an arbitrary input, but it also means that they are
good for brute force and wordlist attacks. To slow down the hashing procedure, we use something
called a key derivation function ( [KDF](https://en.wikipedia.org/wiki/Key_derivation_function)).
[scrypt](https://en.wikipedia.org/wiki/Scrypt), [bcrypt](https://en.wikipedia.org/wiki/Bcrypt) and
[PBKDF2](https://en.wikipedia.org/wiki/PBKDF2) are such functions. They take in a password, a salt
and a number of iterations. Most implementations actually just require a password and a "workload
factor", which simplifies the use of the algorithms.

They work by cryptographic primitives like SHA1, SHA256 or Blowfish, which are then run the number of
iterations together with a salt. They also apply the salt in an
[HMAC](https://en.wikipedia.org/wiki/Hash-based_message_authentication_code) fashion to be
completely secure against many different cryptographic hash attacks.

As you can see from the hash speed list above, scrypt, bcrypt and PBKDF2 are much, much slower than
their relatives. This is very configurable and perfect for password hashing. Developers that
implement these algorithms should aim for the number of iterations it takes to make a password
hashing operation last 50 ms or more on their server.

If we take the example of an 8 character password with the charset a-z, A-Z, 0-9 from above, which
took 4 hours to crack with MD5, and try to crack it using PBKDF2, it would take around 2 years to
crack!

## Conclusion

Use scrypt, bcrypt or PBKDF2 with a high enough work factor that it takes at least 50 ms to compute
a single hash on your server. It takes care of hashing the correct way, applying a salt and usually
uses a CSPRNG to generate the salt. Stay away from everything else.