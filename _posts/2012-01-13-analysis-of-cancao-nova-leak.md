---
title: "Analysis of the Canção Nova leak"
description: "Examining the Cancao Nova breach, with statistics on recovered password lengths, character choices, and wordlist matches."
date: "2012-01-13T05:05:00Z"
last_modified_at: "2016-12-03T09:51:20.791Z"
permalink: "/2012/01/analysis-of-cancao-nova-leak.html"
tags: ["Security"]
---

Yet another site has been breached by hackers. An automated SQL injection tool was used to extract
the data from the website. No signs of automated vulnerability scanning tools in the data.

2047 hashes were cracked out of 2641 hashes. That is 77.5%. Total amount of time spent: 22 minutes

## The Results

### Length distribution

```chart
id: cancao-length
type: "columns"
note: "Share of cracked passwords"
x_label: "Characters"
data: [["≤ 7", 56.89], ["8", 26.43], ["≥ 9", 16.58]]
```

Average password length: 7.32489

### Character distribution

```chart
id: cancao-characters
type: "bars"
note: "Share of character types across all passwords"
decimals: 0
max: 100
data: [["Lowercase letters", 43], ["Uppercase letters", 3], ["Symbols", 1], ["Digits", 53]]
```

### Unique character distribution

```chart
id: cancao-combinations
type: "bars"
note: "Share of passwords using only these characters"
max: 100
data: [["Lowercase only", 29.28], ["Uppercase only", 1.08], ["Symbols only", 0.0], ["Digits only", 41.48], ["Alphanumeric only", 98.46]]
```

### Contained in common wordlists

```chart
id: cancao-wordlists
type: "split"
note: "Share of cracked passwords"
decimals: 0
data: [["In wordlists", 60], ["Not in wordlists", 40]]
```

### Top 30 most common passwords

| Password      | Frequency |
|---------------|-----------|
| `123456`      | 36        |
| `cancaonova`  | 7         |
| `c@nc@0n0v@`  | 6         |
| `jesus33`     | 5         |
| `catolico`    | 4         |
| `gabriel`     | 4         |
| `saojose`     | 4         |
| `251200`      | 4         |
| `123pastor`   | 4         |
| `junior`      | 4         |
| `aleluia`     | 4         |
| `080787`      | 4         |
| `pascom`      | 4         |
| `va010715`    | 4         |
| `654321`      | 3         |
| `musica`      | 3         |
| `deusefiel`   | 3         |
| `belinha`     | 3         |
| `99976860`    | 3         |
| `dombosco`    | 3         |
| `jesusmaria`  | 3         |
| `paroquia`    | 3         |
| `sagrado`     | 3         |
| `aparecida`   | 3         |
| `heavym77`    | 3         |
| `121212`      | 3         |
| `jesuscristo` | 3         |
| `deuseamor`   | 3         |
| `jesus10`     | 3         |
| `sementes`    | 3         |

### Top 30 longest passwords

| Password           | Length |
|--------------------|--------|
| `amoaminhafamilia` | 16     |
| `franciscodeassis` | 16     |
| `michaeloliveira`  | 15     |
| `DEUSSEJALOUVADO`  | 15     |
| `Sagradafamilia`   | 14     |
| `merlin20011976`   | 14     |
| `ANDREFELIPE123`   | 14     |
| `saovicente2009`   | 14     |
| `luizfelipe2008`   | 14     |
| `via-lactea2000`   | 14     |
| `barbanegra1234`   | 14     |
| `santissimo2009`   | 14     |
| `JESUSEOSENHOR`    | 13     |
| `lucia13051967`    | 13     |
| `maria14121983`    | 13     |
| `kyrieeleison7`    | 13     |
| `mariadenazare`    | 13     |
| `contabilidade`    | 13     |
| `fernandodiniz`    | 13     |
| `victoremanuel`    | 13     |
| `eusouoquesou`     | 12     |
| `cerimoniario`     | 12     |
| `familialinda`     | 12     |
| `cruzeiro2003`     | 12     |
| `patricio1986`     | 12     |
| `jesuseuteamo`     | 12     |
| `saosebastiao`     | 12     |
| `katiavaleria`     | 12     |
| `Adoroviver72`     | 12     |
| `paranapanema`     | 12     |

## Notes

The passwords reflect the religious nature of the site as well as the non-English origin of the
site. I used a Spanish wordlist on the site to achieve maximum coverage.