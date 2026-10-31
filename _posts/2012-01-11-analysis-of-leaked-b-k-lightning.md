---
title: "Analysis of leaked B-K Lightning passwords"
description: "Analyzing the B-K Lightning password leak through password lengths, character patterns, common passwords, and wordlist coverage."
date: "2012-01-11T23:33:00Z"
last_modified_at: "2016-12-03T09:51:20.811Z"
permalink: "/2012/01/analysis-of-leaked-b-k-lightning.html"
tags: ["Security"]
---

B-K Lightning was recently the victim of an SQL injection. The team behind it used an automated tool to
find the SQL injection and then used another tool to gather the data. This is evident inside the
data itself. I removed the injection data as it would lower the quality of this analysis.

No passwords were cracked as the site keeps their passwords in clear-text.

## The Results

The leak contains a total of 3288 passwords.

### Length distribution

```chart
id: bk-length
type: "columns"
note: "Share of cracked passwords"
x_label: "Characters"
data: [["≤ 7", 55.07], ["8", 22.91], ["≥ 9", 18.06]]
```

Average password length: 7.132295

### Character distribution

```chart
id: bk-characters
type: "bars"
note: "Share of character types across all passwords"
decimals: 0
max: 100
data: [["Lowercase letters", 55], ["Uppercase letters", 12], ["Symbols", 1], ["Digits", 32]]
```

### Unique character distribution

```chart
id: bk-combinations
type: "bars"
note: "Share of passwords using only these characters"
max: 100
data: [["Lowercase only", 44.06], ["Uppercase only", 5.62], ["Symbols only", 0.0], ["Digits only", 9.26], ["Alphanumeric only", 98.08]]
```

### Contained in common wordlists

```chart
id: bk-wordlists
type: "split"
note: "Share of cracked passwords"
decimals: 0
data: [["In wordlists", 51], ["Not in wordlists", 49]]
```

### Top 30 most common passwords

| Password       | Frequency |
|----------------|-----------|
| `password`     | 20        |
| `lighting`     | 19        |
| `bklighting`   | 19        |
| `123456`       | 12        |
| `light`        | 10        |
| `architect`    | 9         |
| `Password1`    | 6         |
| `1234`         | 6         |
| `electric`     | 6         |
| `lights`       | 5         |
| `sparky`       | 5         |
| `harley`       | 4         |
| `maggie`       | 4         |
| `apex5`        | 4         |
| `thgil`        | 4         |
| `candela`      | 3         |
| `landscape`    | 3         |
| `bbbarch`      | 3         |
| `collins`      | 3         |
| `summit`       | 3         |
| `bcj`          | 3         |
| `12345`        | 3         |
| `chartersills` | 3         |
| `password1`    | 3         |
| `crescent`     | 3         |
| `winston`      | 3         |
| `FISHIES`      | 3         |
| `dallas`       | 3         |
| `4049`         | 3         |
| `CED8078`      | 3         |

### Top 30 longest passwords

| Password                          | Length |
|-----------------------------------|--------|
| `arnie@arniebillmarkelectric.com` | 31     |
| `http://cngtviaghitn.com/`        | 24     |
| `Clements Electrical Inc.`        | 24     |
| `Charleston Engineering`          | 22     |
| `5PkcpNTzbHEstlYcyBtW`            | 20     |
| `mike@mattjoyner.com`             | 19     |
| `SyNOuSBVwijQSrtSdv`              | 18     |
| `aitken landscapes`               | 17     |
| `cpaxco@gmail.com`                | 16     |
| `allworthnussbaum`                | 16     |
| `hfMKBEwyuWaOhpau`                | 16     |
| `melissanatoli14`                 | 15     |
| `andrewgordoninc`                 | 15     |
| `arizonalighting`                 | 15     |
| `candelalighting`                 | 15     |
| `allenindustries`                 | 15     |
| `ashleyannhefner`                 | 15     |
| `bhtarchitecture`                 | 15     |
| `REYMISTERIO619`                  | 14     |
| `bklighting2072`                  | 14     |
| `aharchitecture`                  | 14     |
| `9817compadrito`                  | 14     |
| `exteriorlights`                  | 14     |
| `brownwholesale`                  | 14     |
| `lightingdesign`                  | 14     |
| `interiordesign`                  | 14     |
| `electricalaces`                  | 14     |
| `dancing55dane`                   | 13     |
| `butlerarmsden`                   | 13     |

## Notes

The data this analysis is based on is doubtful as it was extracted without any regard to data
consistency. This is partly due to an error-based SQL injection being used (limits the length of the
strings given) and the fact that it was extracted from the output of the web application itself.