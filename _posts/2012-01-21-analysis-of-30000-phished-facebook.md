---
title: "Analysis of 30,000 phished Facebook accounts"
description: "Analyzing phished Facebook account passwords, including data quality, password lengths, character patterns, and common choices."
date: "2012-01-21T23:56:00Z"
last_modified_at: "2016-12-03T09:51:20.826Z"
permalink: "/2012/01/analysis-of-30000-phished-facebook.html"
tags: ["Security"]
---

This analysis is based on 7 leaks of [phished](https://en.wikipedia.org/wiki/Phishing) Facebook
accounts leaked by the hackers 0x0mar and Hannibal. One of the leaks from Hannibal was advertised
to contain over 100.000 accounts, but it seems that he can't count since the leak only contained
a combined total of 25.000 accounts.

No passwords were cracked, all passwords were phished.

## Data Validity

As always with phished accounts, there is a lot of garbage and that makes the analysis have a high
statistical error. Together with the fact that all 7 leaks contained duplicate accounts (same email
and password combination multiple times) and the fact that around 2.000 accounts had a password
length less than what the Facebook policy allows, the apparent quality of the leaks is very low.
After filtering the data and removing garbage, I ended up with 27.978 accounts.

## The Results

### Length distribution

```chart
id: facebook-length
type: "columns"
note: "Share of cracked passwords"
x_label: "Characters"
data: [["≤ 7", 42.07], ["8", 17.54], ["≥ 9", 40.39]]
```

Average password length: 8,579955

### Character distribution

```chart
id: facebook-characters
type: "bars"
note: "Share of character types across all passwords"
decimals: 0
max: 100
data: [["Lowercase letters", 45], ["Uppercase letters", 3], ["Symbols", 4], ["Digits", 48]]
```

### Unique character distribution

```chart
id: facebook-combinations
type: "bars"
note: "Share of passwords using only these characters"
max: 100
data: [["Lowercase only", 26.71], ["Uppercase only", 0.6], ["Symbols only", 0.03], ["Digits only", 31.64], ["Alphanumeric only", 95.06]]
```

### Contained in common wordlists

```chart
id: facebook-wordlists
type: "split"
note: "Share of cracked passwords"
decimals: 0
data: [["In wordlists", 38], ["Not in wordlists", 62]]
```

### Top 30 most common passwords

| Password     | Frequency |
|--------------|-----------|
| `123456`     | 285       |
| `sayang`     | 108       |
| `123456789`  | 68        |
| `4181547`    | 38        |
| `sayangku`   | 36        |
| `12345678`   | 33        |
| `654321`     | 29        |
| `1234567`    | 23        |
| `222222`     | 23        |
| `ledia100`   | 20        |
| `111111`     | 20        |
| `888888`     | 18        |
| `1234567890` | 17        |
| `olatedua`   | 17        |
| `112233`     | 16        |
| `123123`     | 16        |
| `555555`     | 14        |
| `malaysia`   | 14        |
| `987654321`  | 13        |
| `fuckoff`    | 13        |
| `121212`     | 12        |
| `777777`     | 11        |
| `naruto`     | 11        |
| `878787`     | 10        |
| `kucing`     | 9         |
| `kokwei0923` | 9         |
| `pokeher2`   | 9         |
| `47454745`   | 8         |
| `223344`     | 8         |
| `987654`     | 8         |

### Top 30 longest passwords

| Password                                             | Length |
|------------------------------------------------------|--------|
| `02D_FDWsKtZEQOjYm0wqjhPv9pgv0pzhkvsb0vSwwN1uEjsjQH` | 50     |
| `mimomamimoma19mimomamimomamimomamimoma19mimomamimo` | 50     |
| `https://www.google.com/accounts/ServiceLogin`       | 44     |
| `christobaltuntankamon270562270562270562`            | 39     |
| `https://login.facebook.com/login.php`               | 36     |
| `brandonalanandenjeilusabinaforever`                 | 34     |
| `http://www.minecraft.net/login.jsp`                 | 34     |
| `c3ca63e506e38a063a0201ebff022c5c`                   | 32     |
| `6d032c684830caa13caa5ba54515630d`                   | 32     |
| `b00ecb05fcefa6f85d4ba09453c8ca3f`                   | 32     |
| `db30b2d4e00449b05692f98e5ee20759`                   | 32     |
| `d042b72204c0b2fee667aafd89f1bb20`                   | 32     |
| `https://login.live.com/login.srf`                   | 32     |
| `0909714174 tuannguyen 0909714174`                   | 32     |
| `4740205445 TRANG OSLO 0906600665`                   | 32     |
| `7d12a5bbb0939f749f98ad394da19c6e`                   | 32     |
| `virginiascalzer9725859410061010`                    | 31     |
| `https://www.login.facebook.com`                     | 30     |
| `ishaqbinjeffallahistheonlygod`                      | 29     |
| `https://secure.schuelervz.net`                      | 29     |
| `https://www.banesconline.com`                       | 28     |
| `adhit_hikamatullah@yahoo.com`                       | 28     |
| `https://www.otpbankdirekt.hu`                       | 28     |
| `http://www.eurogangster.com`                        | 27     |
| `https://login.facebook.com`                         | 26     |
| `http://www.fattoincasa.biz`                         | 26     |
| `session[username_or_email]`                         | 26     |
| `hecamehesawheconquered2010`                         | 26     |
| `moradnasar354@hotmail.com`                          | 25     |