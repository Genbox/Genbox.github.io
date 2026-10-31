---
title: "Analysis of the XboxLiveClans leak"
description: "Examining the XboxLiveClans breach and the leaked passwords, including character distributions, wordlist coverage, and common choices."
date: "2012-02-04T23:58:00Z"
last_modified_at: "2016-12-03T09:51:20.832Z"
permalink: "/2012/02/analysis-of-xboxliveclans-leak.html"
tags: ["Security"]
---

XboxLiveClans was hacked by a hacker with the alias alsa7r. Their database was leaked with a total
of 94 columns. A total of 34501 users reside in the database. The password hashes are salted with a
dynamically sized salt that is also contained in the database.

No passwords were cracked. 21002 cracked passwords were leaked by the hacker.

## The Hash Function

The hacker talks about the hash function being md5(md5(\$pass).md5(\$salt)), however, I have not
been able to confirm this. The description of the hash function, given by the hacker, is vague and
filled with spelling errors, which only complicates the cracking of the hashes.

## The Results

### Length distribution

```chart
id: xboxliveclans-length
type: "columns"
note: "Share of cracked passwords"
x_label: "Characters"
data: [["≤ 7", 41.12], ["8", 21.06], ["≥ 9", 37.82]]
```

Average password length: 7,99123893

### Character distribution

```chart
id: xboxliveclans-characters
type: "bars"
note: "Share of character types across all passwords"
decimals: 0
max: 100
data: [["Lowercase letters", 50], ["Uppercase letters", 15], ["Symbols", 0], ["Digits", 35]]
```

### Unique character distribution

```chart
id: xboxliveclans-combinations
type: "bars"
note: "Share of passwords using only these characters"
max: 100
data: [["Lowercase only", 33.74], ["Uppercase only", 0.7], ["Symbols only", 0.0], ["Digits only", 7.28], ["Alphanumeric only", 99.47]]
```

### Contained in common wordlists

```chart
id: xboxliveclans-wordlists
type: "split"
note: "Share of cracked passwords"
decimals: 0
data: [["In wordlists", 68], ["Not in wordlists", 32]]
```

### Contained in IQ wordlist ([Click here for more info](/2012/01/building-perfect-wordlist.html))

```chart
id: xboxliveclans-iq
type: "split"
note: "Share of cracked passwords"
decimals: 0
data: [["In IQ wordlist", 86], ["Not in IQ wordlist", 14]]
```

### Top 30 most common passwords

| Password     | Frequency |
|--------------|-----------|
| 123456       | 140       |
| password     | 106       |
| 123456789    | 91        |
| xbox360      | 49        |
| abc123       | 47        |
| 7uGd5HIp2J   | 46        |
| ike02banaA   | 40        |
| football     | 39        |
| qwerty123456 | 30        |
| qwerty       | 29        |
| baseball     | 29        |
| monkey       | 28        |
| 111111       | 26        |
| timosha      | 26        |
| xboxlive     | 25        |
| Russian1     | 24        |
| asDGVy3898   | 23        |
| eqeS606898   | 23        |
| ZVjmHgC355   | 23        |
| liverpool    | 21        |
| killer       | 21        |
| skills12     | 20        |
| hockey       | 20        |
| arsenal      | 20        |
| Russian7     | 18        |
| cheese       | 18        |
| qq123456     | 18        |
| master       | 18        |
| Bigman12131  | 17        |
| Blabla159    | 16        |

### Top 30 longest passwords

| Password           | Length |
|--------------------|--------|
| Moneymaker87654321 | 18     |
| JXthtnmrjdflbv1    | 15     |
| takenoprisoners    | 15     |
| 123123123123123    | 15     |
| dynastywarriors    | 15     |
| sklifsupermudak    | 15     |
| moneymoneymoney    | 15     |
| johnnyknoxville    | 15     |
| celtic6rangers2    | 15     |
| godblessamerica    | 15     |
| monkeybusiness     | 14     |
| smallville1987     | 14     |
| Czechoslovakia     | 14     |
| mightymariner1     | 14     |
| hjgjfvgjcdgjdj     | 14     |
| drujokbyviagra     | 14     |
| dragonslayer12     | 14     |
| 77obafanovka77     | 14     |
| liverpoolfc123     | 14     |
| newpassword123     | 14     |
| u0HgtKt617bvfd     | 14     |
| blackandyellow     | 14     |
| CtNI3F97ullian     | 14     |
| lkfdjkfjkdfdgg     | 14     |
| 5435idaeinthis     | 14     |
| thekingofkings     | 14     |
| electricguitar     | 14     |
| masterchief117     | 14     |
| bloodyknuckles     | 14     |
| westviewgold11     | 14     |