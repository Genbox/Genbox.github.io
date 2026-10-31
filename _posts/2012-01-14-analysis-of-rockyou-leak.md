---
title: "Analysis of the RockYou leak"
description: "Examining the RockYou breach and its plaintext passwords through length distributions, character patterns, and common passwords."
date: "2012-01-14T05:41:00Z"
last_modified_at: "2016-12-03T09:51:20.815Z"
permalink: "/2012/01/analysis-of-rockyou-leak.html"
tags: ["Security"]
---

This is yet another old, but very interesting leak. RockYou was breached back in December 2009 and a
total of 32.603.388 passwords were released. There have been some detailed
[reports](https://www.cs.unh.edu/~it666/reading_list/AAA/consumer_password_worst_practices.pdf) based on
[this](https://techcrunch.com/2009/12/14/rockyou-hacked/) leak. Not only was the leak one of the
largest in history, but it also serves as a lesson to companies how **not** to handle a breach.

No passwords were cracked, all passwords were stored in clear text.

## The Results

### Length distribution

```chart
id: rockyou-length
type: "columns"
note: "Share of cracked passwords"
x_label: "Characters"
data: [["≤ 7", 49.65], ["8", 19.98], ["≥ 9", 30.37]]
```

Average password length: 7,882864

### Character distribution

```chart
id: rockyou-characters
type: "bars"
note: "Share of character types across all passwords"
decimals: 0
max: 100
data: [["Lowercase letters", 56], ["Uppercase letters", 4], ["Symbols", 3], ["Digits", 37]]
```

### Unique character distribution

```chart
id: rockyou-combinations
type: "bars"
note: "Share of passwords using only these characters"
max: 100
data: [["Lowercase only", 41.68], ["Uppercase only", 1.5], ["Symbols only", 0.02], ["Digits only", 15.93], ["Alphanumeric only", 96.76]]
```

### Contained in common wordlists

```chart
id: rockyou-wordlists
type: "split"
note: "Share of cracked passwords"
decimals: 0
data: [["In wordlists", 94], ["Not in wordlists", 6]]
```

### Top 30 most common passwords

| Password    | Frequency |
|-------------|-----------|
| `123456`    | 290731    |
| `12345`     | 79078     |
| `123456789` | 76790     |
| `password`  | 59463     |
| `iloveyou`  | 49952     |
| `princess`  | 33291     |
| `1234567`   | 21727     |
| `rockyou`   | 20903     |
| `12345678`  | 20553     |
| `abc123`    | 16648     |
| `nicole`    | 16228     |
| `daniel`    | 15311     |
| `babygirl`  | 15163     |
| `monkey`    | 14726     |
| `lovely`    | 14331     |
| `jessica`   | 14104     |
| `654321`    | 13984     |
| `michael`   | 13981     |
| `ashley`    | 13488     |
| `qwerty`    | 13456     |
| `111111`    | 13272     |
| `iloveu`    | 13134     |
| `000000`    | 13028     |
| `michelle`  | 12715     |
| `tigger`    | 11761     |
| `sunshine`  | 11489     |
| `chocolate` | 11289     |
| `password1` | 11113     |
| `soccer`    | 10836     |
| `anthony`   | 10755     |

## Notes

I did not provide a top 30 longest passwords list this time as the list just would have contained a
lot of 255 character long HTML garbage. However, I did remove the data prior to calculating the
average password length.