---
title: "Analysis of the Gawker leak"
description: "Analyzing the Gawker password leak, including cracking methods, specialized hardware, and patterns in recovered passwords."
date: "2012-01-13T22:21:00Z"
last_modified_at: "2016-12-03T09:51:20.822Z"
permalink: "/2012/01/analysis-of-gawker-leak.html"
tags: ["Security"]
---

I'm going to post an analysis I did some time ago, in the new format I built for this blog. This is
the famous Gawker leak that got everyone up from their chairs. There have been several [other
analyses](https://web.archive.org/web/20130114073547/https://blog.duosecurity.com/2010/12/brief-analysis-of-the-gawker-password-dump/) of the
leak, however, to my knowledge, this analysis contains the largest sample of passwords. Gawker was
using Unix DES and OpenBSD Blowfish as encryption. [Unix
DES](https://en.wikipedia.org/wiki/Crypt_%28Unix%29#Traditional_DES-based_scheme) hashes can be
cracked on the GPU, so I started working on DES instead of Blowfish.

The leak contained a total of 748098 Unix DES hashes, 188281 passwords were provided by the
attackers, so they were put into a wordlist before cracking. A total of 474229 hashes were cracked,
that is 63.39%. Only 9 hours were spent on cracking.

## The Cracking

An important aspect of password cracking is to counter the counter-measures of wordlist cracking.
Unix DES uses a 12 bit salt and the fact that it performs 25 DES encryptions of the password also
makes it a lot harder to crack. However, the Unix DES algorithm fails in that the password is
truncated to 8 characters. This means we can optimize our wordlists and brute force attacks to only
be a maximum of 8 characters. As for the salts, use your most efficient wordlists first and remove
the hashes from the hashlist once they are cracked. This will speed up the cracking process every
time a hash has been cracked.

Compared to other algorithms, Unix DES is very resource intensive. In this crack, I split the
hashlist into the following partial hashlists:

1. 10%
2. 10%
3. 10%
4. 10%
5. 60%

I then started lists 1-4 on the CPU and list 5 on the GPU. This way I used all the resources
available to me. Duplicate hashes were removed prior to cracking to ensure that we are working on files as
small as possible.

## Specialized Hardware

DES has been the subject of password cracking for a very long time as the DES algorithm has been
widely implemented. Specialized hardware has been created to crack DES, hardware such as the
[COPACOBANA](http://www.copacobana.org/) or the [BEE2](http://bee2.eecs.berkeley.edu/) platform.
Security researchers have even optimized the cracking of [Unix DES on
PS3](https://www.zorinaq.com/talks/breaking-unix-crypt.pdf) by minimizing the amount of gates per
[S-Box](https://en.wikipedia.org/wiki/S-box).

Today we have much more raw power in clustered environments such as CPU/GPU clouds. One could spend
a good amount of money to rent a GPU cloud and break a Unix DES hash within a few weeks. However, in
this crack, I utilized a high-end 4 core i7 CPU and a high-end CUDA based GPU.

## The Results

### Length distribution

```chart
id: gawker-length
type: columns
note: Share of cracked passwords
x_label: Characters
max: 50
data: [[1, 0.03], [2, 0.07], [3, 0.39], [4, 2.45], [5, 3.98], [6, 30.20], [7, 19.83], [8, 43.06]]
```

Average password length: 6.954842

### Character distribution

```chart
id: gawker-characters
type: bars
note: Share of character types across all passwords
decimals: 0
max: 100
data: [["Lowercase letters", 65], ["Uppercase letters", 3], ["Symbols", 1], ["Digits", 31]]
```

### Unique character distribution

```chart
id: gawker-combinations
type: bars
note: Share of passwords using only these characters
max: 100
data: [["Lowercase only", 55.38], ["Uppercase only", 0.60], ["Symbols only", 0.02], ["Digits only", 10.78], ["Alphanumeric only", 99.32]]
```

### Contained in common wordlists

```chart
id: gawker-wordlists
type: split
note: Share of cracked passwords
decimals: 0
data: [["In wordlists", 79], ["Not in wordlists", 21]]
```

### Top 30 most common passwords

| Password   | Frequency |
|------------|-----------|
| `123456`   | 4162      |
| `password` | 3332      |
| `12345678` | 1444      |
| `lifehack` | 861       |
| `qwerty`   | 765       |
| `abc123`   | 529       |
| `12345`    | 503       |
| `monkey`   | 471       |
| `111111`   | 439       |
| `consumer` | 410       |
| `letmein`  | 391       |
| `1234`     | 372       |
| `dragon`   | 331       |
| `trustno1` | 322       |
| `gizmodo`  | 320       |
| `baseball` | 319       |
| `whatever` | 311       |
| `superman` | 305       |
| `1234567`  | 288       |
| `iloveyou` | 278       |
| `sunshine` | 275       |
| `fuckyou`  | 269       |
| `starwars` | 268       |
| `shadow`   | 267       |
| `princess` | 247       |
| `cheese`   | 241       |
| `123123`   | 238       |
| `computer` | 234       |
| `football` | 232       |
| `gawker`   | 231       |

### Top 30 longest passwords

| Password   | Length |
|------------|--------|
| `formula1` | 8      |
| `abbyanne` | 8      |
| `evan0509` | 8      |
| `starwars` | 8      |
| `cobra198` | 8      |
| `jalopnik` | 8      |
| `iamrevan` | 8      |
| `respect1` | 8      |
| `suikoden` | 8      |
| `h3L1lsM3` | 8      |
| `hihihihi` | 8      |
| `romanemp` | 8      |
| `chelsea1` | 8      |
| `18341834` | 8      |
| `ssjgohan` | 8      |
| `nopants1` | 8      |
| `satking1` | 8      |
| `megaman1` | 8      |
| `sarcoma8` | 8      |
| `kitty151` | 8      |
| `snakeeat` | 8      |
| `macarthe` | 8      |
| `element1` | 8      |
| `1234qwer` | 8      |
| `stanford` | 8      |
| `vent1234` | 8      |
| `wilma123` | 8      |
| `fuckthes` | 8      |
| `tanstaaf` | 8      |
| `villaflo` | 8      |