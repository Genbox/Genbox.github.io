---
title: "Power-Blog.com password leak analysis"
description: "Analyzing the Power-Blog.com password leak, including MD5 cracking results and patterns in the recovered passwords."
date: "2012-02-12T20:33:00Z"
last_modified_at: "2016-12-03T09:51:20.784Z"
permalink: "/2012/02/power-blogcom-password-leak-analysis.html"
tags: ["Security"]
---

Power-Blog.com was hacked and their database released. The leak contains a total of 5860 MD5 hashes.
The data contains 3 hashes of passwords normally used by automated SQLi tools, this might indicate
that the website was hacked by an SQLi flaw in the website.

A total of 5067 hashes were cracked. That is 86,46%. It took 4 hours and 19 minutes to crack them.

## The Results

### Length distribution

```chart
id: powerblog-length
type: "columns"
note: "Share of cracked passwords"
x_label: "Characters"
data: [["≤ 7", 44.03], ["8", 37.58], ["≥ 9", 18.39]]
```

Average password length: 7,5267466

### Character distribution

```chart
id: powerblog-characters
type: "bars"
note: "Share of character types across all passwords"
decimals: 0
max: 100
data: [["Lowercase letters", 46], ["Uppercase letters", 11], ["Symbols", 0], ["Digits", 43]]
```

### Unique character distribution

```chart
id: powerblog-combinations
type: "bars"
note: "Share of passwords using only these characters"
max: 100
data: [["Lowercase only", 31.93], ["Uppercase only", 1.14], ["Symbols only", 0.0], ["Digits only", 17.21], ["Alphanumeric only", 99.72]]
```

### Contained in common wordlists

```chart
id: powerblog-wordlists
type: "split"
note: "Share of cracked passwords"
decimals: 0
data: [["In wordlists", 56], ["Not in wordlists", 44]]
```

### Contained in IQ wordlist ([Click here for more info](/2012/01/building-perfect-wordlist.html))

```chart
id: powerblog-iq
type: "split"
note: "Share of cracked passwords"
decimals: 0
data: [["In IQ wordlist", 60], ["Not in IQ wordlist", 40]]
```

### Top 30 most common passwords

| Password   | Frequency |
|------------|-----------|
| 123456     | 161       |
| apples12   | 30        |
| 000000     | 14        |
| super123   | 14        |
| 786000     | 14        |
| sonor98    | 13        |
| 19661102   | 13        |
| 123456789  | 11        |
| 111111     | 11        |
| 112233     | 9         |
| success    | 9         |
| qwerty123  | 7         |
| powerblog  | 7         |
| marina     | 7         |
| 123456abc  | 6         |
| 58138948   | 6         |
| 654321     | 6         |
| 12345678   | 5         |
| lovexinh   | 5         |
| 7550708    | 5         |
| killer9987 | 4         |
| eudoh065   | 4         |
| 666888     | 4         |
| 82338233   | 4         |
| tt1314520  | 4         |
| abc123     | 4         |
| lddocbz    | 4         |
| asdfasdf   | 4         |
| 444444     | 4         |
| Knight     | 4         |

### Top 30 longest passwords

| Password        | Length |
|-----------------|--------|
| Chidvilasananda | 15     |
| nguyentrongtinh | 15     |
| unitedstatesofa | 15     |
| zaihuishou2008  | 14     |
| trequan1234567  | 14     |
| hatamikia2006   | 13     |
| divertisment    | 12     |
| 198005231234    | 12     |
| lovelygirl16    | 12     |
| adnan12ahsan    | 12     |
| amalgamation    | 12     |
| 123456abcdef    | 12     |
| fiddlefaddle    | 12     |
| lasvegas2009    | 12     |
| ranveersingh    | 12     |
| blessings888    | 12     |
| 198403160316    | 12     |
| liverpool296    | 12     |
| eaglesong777    | 12     |
| emamzaman12     | 11     |
| 09324115296     | 11     |
| smartnet456     | 11     |
| lovelove123     | 11     |
| greenfields     | 11     |
| makemoney77     | 11     |
| vatanperver     | 11     |
| super77star     | 11     |
| edumedicina     | 11     |
| caterpillar     | 11     |
| 13631365772     | 11     |