---
title: "Analysis of 1,051 phished Xbox accounts"
description: "Analyzing 1,051 phished Xbox account passwords, with statistics on length, character patterns, wordlist coverage, and frequent passwords."
date: "2012-02-05T00:17:00Z"
last_modified_at: "2016-12-03T09:51:20.788Z"
permalink: "/2012/02/analysis-of-1051-phished-xbox-accounts.html"
tags: ["Security"]
---

Xbox Live users were phished by an unknown hacker. As with other phishing attacks, a lot of the
passwords are actually fake. Nevertheless, I've made this analysis to give some details into
phished passwords.

No passwords were cracked. 1051 passwords were phished by the hacker.

## The Results

### Length distribution

```chart
id: xbox-phished-length
type: "columns"
note: "Share of cracked passwords"
x_label: "Characters"
data: [["≤ 7", 35.97], ["8", 20.93], ["≥ 9", 43.1]]
```

Average password length: 8,77830637

### Character distribution

```chart
id: xbox-phished-characters
type: "bars"
note: "Share of character types across all passwords"
decimals: 0
max: 100
data: [["Lowercase letters", 55], ["Uppercase letters", 4], ["Symbols", 2], ["Digits", 39]]
```

### Unique character distribution

```chart
id: xbox-phished-combinations
type: "bars"
note: "Share of passwords using only these characters"
max: 100
data: [["Lowercase only", 33.11], ["Uppercase only", 1.05], ["Symbols only", 0.0], ["Digits only", 7.8], ["Alphanumeric only", 96.96]]
```

### Contained in common wordlists

```chart
id: xbox-phished-wordlists
type: "split"
note: "Share of cracked passwords"
decimals: 0
data: [["In wordlists", 54], ["Not in wordlists", 46]]
```

### Contained in IQ wordlist ([Click here for more info](/2012/01/building-perfect-wordlist.html))

```chart
id: xbox-phished-iq
type: "split"
note: "Share of cracked passwords"
decimals: 0
data: [["In IQ wordlist", 56], ["Not in IQ wordlist", 44]]
```

### Top 30 most common passwords

| Password         | Frequency |
|------------------|-----------|
| 123456           | 13        |
| doncasterrovers9 | 7         |
| 123456789        | 7         |
| soccer           | 6         |
| password         | 5         |
| falconer2010     | 4         |
| elliemaytaylor   | 4         |
| HX78D            | 4         |
| roni10           | 4         |
| duke123          | 4         |
| ducks13          | 4         |
| pokemon          | 3         |
| 13474885329      | 3         |
| 20fleur20        | 3         |
| benandtom1996    | 3         |
| ngugi123         | 3         |
| fdsaws22         | 3         |
| yokiller         | 3         |
| tgrimes          | 3         |
| superman         | 3         |
| shammi1234       | 3         |
| zakimilano       | 3         |
| gguy2122         | 3         |
| chiquitamunn     | 3         |
| cedisblack       | 3         |
| gateway          | 3         |
| aceace11         | 3         |
| kmason           | 2         |
| paul21           | 2         |
| 12345678Fj       | 2         |

### Top 30 longest passwords

| Password                   | Length |
|----------------------------|--------|
| nguyenanhduc998@hotmail.de | 26     |
| jordanarmstrong1234        | 19     |
| jaksonandsnoopdogg         | 18     |
| fightforlifesr210          | 17     |
| doncasterrovers9           | 16     |
| godofhoney687297           | 16     |
| arizonacardinals           | 16     |
| 0204199802041998           | 16     |
| adorolamusikahou           | 16     |
| randumperson1230           | 16     |
| GrimmjoW6EspadA            | 15     |
| bayhoalongbnngo            | 15     |
| vancouverisgood            | 15     |
| killerkiller123            | 15     |
| warning60278161            | 15     |
| youareadickhead            | 15     |
| PaTiKaS19960707            | 15     |
| tracey123456789            | 15     |
| yourmum93080005            | 15     |
| fuckyouasswhole            | 15     |
| metallicahermes            | 15     |
| DAN196129ALEXIS            | 15     |
| GTAChivas794RST            | 15     |
| elliemaytaylor             | 14     |
| dirtracing2010             | 14     |
| thekingofkings             | 14     |
| 60065246006524             | 14     |
| lajfalfaflkfja             | 14     |
| underworld8888             | 14     |
| blah blah blah             | 14     |

## Notes

The longest password in the list has been omitted from the 'Top 30 longest passwords' list above.
The password is highly offensive and a total of 257 characters in length. It was made by a user as
a message to the hacker.