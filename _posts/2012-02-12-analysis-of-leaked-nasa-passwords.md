---
title: "Analysis of leaked NASA passwords"
description: "Analyzing 444 plaintext passwords from a NASA data leak, including lengths, character patterns, and wordlist coverage."
date: "2012-02-12T20:46:00Z"
last_modified_at: "2016-12-03T09:51:20.796Z"
permalink: "/2012/02/analysis-of-leaked-nasa-passwords.html"
tags: ["Security"]
---

NASA has [yet
again](http://nakedsecurity.sophos.com/2012/02/09/nasa-hack-anniversary-gary-mckinnon/?utm_source=feedburner&utm_medium=feed&utm_campaign=Feed%3A+nakedsecurity+%28Naked+Security+-+Sophos%29)
been hacked and their data leaked. The data can be found as a list of accounts or a full SQL dump
with a size of 6.6Gb. The leak contains a total of 444 passwords.

No passwords were cracked as the passwords were in cleartext.

## The Results

### Length distribution

```chart
id: nasa-length
type: "columns"
note: "Share of cracked passwords; longer passwords not shown"
x_label: "Characters"
max: 35
data: [[1, 0.0], [2, 0.0], [3, 0.9], [4, 2.25], [5, 5.86], [6, 11.71], [7, 11.71], [8, 30.63]]
```

Average password length: 8,479729

### Character distribution

```chart
id: nasa-characters
type: "bars"
note: "Share of character types across all passwords"
decimals: 0
max: 100
data: [["Lowercase letters", 40], ["Uppercase letters", 19], ["Symbols", 10], ["Digits", 31]]
```

### Unique character distribution

```chart
id: nasa-combinations
type: "bars"
note: "Share of passwords using only these characters"
max: 100
data: [["Lowercase only", 23.65], ["Uppercase only", 0.23], ["Symbols only", 0.0], ["Digits only", 4.05], ["Alphanumeric only", 77.03]]
```

### Contained in common wordlists

```chart
id: nasa-wordlists
type: "split"
note: "Share of cracked passwords"
decimals: 0
data: [["In wordlists", 31], ["Not in wordlists", 69]]
```

### Contained in IQ wordlist ([Click here for more info](/2012/01/building-perfect-wordlist.html))

```chart
id: nasa-iq
type: "split"
note: "Share of cracked passwords"
decimals: 0
data: [["In IQ wordlist", 36], ["Not in IQ wordlist", 64]]
```

### Top 30 most common passwords

| Password     | Frequency |
|--------------|-----------|
| ERA2011      | 9         |
| Nasa1234     | 8         |
| llama        | 5         |
| green        | 5         |
| bd122253     | 5         |
| dixie777     | 4         |
| Jud4532      | 3         |
| password     | 3         |
| Mar0ngelli   | 3         |
| 12345        | 3         |
| 123456       | 3         |
| Wes&Jo4Ever  | 2         |
| mdjwaj35     | 2         |
| Nicole12     | 2         |
| VDkiwilander | 2         |
| Nasalarss08  | 2         |
| Matt1q!Q     | 2         |
| chs12345     | 2         |
| vote         | 2         |
| keithwa      | 2         |
| !QAZ1qaz     | 2         |
| reset123     | 2         |
| letmein      | 2         |
| abc123       | 2         |
| test         | 2         |
| amsco86      | 2         |
| 1dragon      | 2         |
| firstship1   | 2         |
| nasa1234     | 2         |
| iitdreamer1  | 2         |

### Top 30 longest passwords

| Password                        | Length |
|---------------------------------|--------|
| \$kF9(8{pc%{^6Cn3v4N28,3@&@43qt | 30     |
| henry.p.russell@nasa.gov        | 24     |
| Hopemontcircle358               | 17     |
| 2vote4vid@LaRC!                 | 15     |
| Club123Club123!                 | 15     |
| JupiterPl@net5                  | 14     |
| PortWarwick12\*                 | 14     |
| c,=\$\*06iT~gPht                | 14     |
| JacksonHole690                  | 14     |
| samanapatiala                   | 13     |
| Tni2wg22@1234                   | 13     |
| Endwave!@#123                   | 13     |
| blackpearl007                   | 13     |
| varshavarsha1                   | 13     |
| peashooterP26                   | 13     |
| BlueMoon#8354                   | 13     |
| Shummies@5272                   | 13     |
| vreauCosmin13                   | 13     |
| greenaviation                   | 13     |
| 123Mic=hel123                   | 13     |
| Kokalolloms86                   | 13     |
| shadow5714(4)                   | 13     |
| Steve@123456#                   | 13     |
| Wallflowers#1                   | 13     |
| Funvegas2009!                   | 13     |
| Tiff20045467!                   | 13     |
| VotesCount123                   | 13     |
| prasannakumar                   | 13     |
| Ymqcaadp#1232                   | 13     |
| nMPPOle^ed042                   | 13     |