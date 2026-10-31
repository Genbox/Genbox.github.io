---
title: "Analysis of the Gamigo hashes"
description: "Analyzing the Gamigo password hashes through cracking results, password strength, character patterns, email addresses, and domains."
date: "2012-08-27T16:09:00Z"
last_modified_at: "2016-12-03T09:51:20.794Z"
permalink: "/2012/08/analysis-of-gamigo-hashes.html"
tags: ["Security"]
---

This leak analysis is dedicated to Steve Gibson of [Gibson Research
Corporation](https://www.grc.com/intro.htm).  
Thanks for a great show Steve!

Back in February, a large gaming site called Gamigo was
[hacked](https://web.archive.org/web/20130103055435/http://www.zdnet.com/8-24-million-gamigo-passwords-leaked-after-hack-7000001403/), and in
July, the full list of emails and hashes found their way onto the Internet.
[Pwnedlist.com](http://pwnedlist.com/) are the kind providers of the hashes for this analysis, and
as an added bonus, they also sent me the emails for this analysis. A huge thanks goes out to
Pwnedlist.com for their kindness.

The leak contains 9.475.226 valid MD5 hashes and 8.261.454 emails. It has 7.028.067 unique hashes
and 8.244.423 unique emails.

In the time-frame of 7 days, 19 hours and 3 seconds, I was able to crack 7.731.708 hashes (81,6%).

## Cracking System

The cracking was done on an ordinary GeForce 560 TI, 1024MB RAM graphics card using Hashcat-Plus
v0.081 64bit. The settings of Hashcat were set to low, which resulted in only 90% cracking
efficiency. Had it been optimized, the full crack would have taken 6 days and 20 hours.

Different cracking techniques such as keyboard-walking, character repetition and leet speak were
used to obtain the high number of cracked passwords.

## Character Distribution

A healthy character distribution has equal amounts of each character type. Gamigo must have had a
less than optimal password policy, as it seems that you could create passwords with whatever
characters you want.

```chart
id: gamigo-characters
type: "bars"
note: "Share of character types across all passwords"
decimals: 0
max: 100
data: [["Lowercase letters", 46], ["Uppercase letters", 7], ["Symbols", 10], ["Digits", 37]]
```

## Unique Character Distribution

Again, we are reminded of the missing password policy at Gamigo. 28% of the passwords are digits
only, with a good password policy, this would not have been possible.

```chart
id: gamigo-combinations
type: "bars"
note: "Share of passwords using only one character type"
decimals: 0
max: 100
data: [["Lowercase only", 71], ["Uppercase only", 1], ["Symbols only", 0], ["Digits only", 28]]
```

## Password Composition

When we take a look at the password composition, we count how many passwords contain symbols. It
turns out that only 13.566 passwords that were recovered contained a symbol, and 7.718.142 that did
not. This resulted in the rather boring chart:

```chart
id: gamigo-composition
type: "split"
note: "Share of cracked passwords"
decimals: 0
data: [["Alphanumeric", 100], ["Not alphanumeric", 0]]
```

## Password Length

Gamigo has 2 passwords with length 0 and 20 passwords with length 1. These might be passwords
created during the development of the site - and they might have been the way the hackers originally
hacked the site (first password check in most brute forcers is nothing).

We observe something quite unusual here, and that is the high number of 10 character passwords. The
password lengths also show the missing password policy, as you can have whatever length you like.

```chart
id: gamigo-length
type: "columns"
note: "Share of cracked passwords"
x_label: "Characters"
decimals: 0
max: 35
data: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 1], [5, 2], [6, 14], [7, 9], [8, 26], [9, 11], [10, 29], [11, 4], [12, 2], [13, 1], [14, 0]]
```

The positive side of the case, is that the high number of 10 character passwords pushed the average
password length up to 8,52 characters; higher than usual.

### 10 Longest Passwords

The 10 longest passwords give an idea of how low strength long passwords can have. Repetition and
common patterns are used to create long passwords; however, they are easily cracked using modern
password cracking techniques.

| Password                   | Length |
|----------------------------|--------|
| frontschweinefrontschweine | 26     |
| qwertyuiopasdfghjklzxcvbnm | 26     |
| stevieboy74stevieboy74     | 22     |
| needforspeedmostwanted     | 22     |
| lllllllllllllllllllll      | 21     |
| qaywsxedcrfvtgbzhnujm      | 21     |
| sivispacemparabellum       | 20     |
| abcdefghijklmnopqrst       | 20     |
| 12345678900987600000       | 20     |
| 1qazxcvbnm1qazxcvbnm       | 20     |

### 10 Shortest Passwords

The 10 shortest passwords are hopefully not user passwords. Both a, b and c are among the shortest
passwords, which leads me to believe that they are internal testing passwords or passwords created
during development.

| Password | Length |
|----------|--------|
|          | 0      |
| x        | 1      |
| g        | 1      |
| a        | 1      |
| 2        | 1      |
| ½        | 1      |
| b        | 1      |
| c        | 1      |
| S        | 1      |
| 5        | 1      |

## Password Strength

A strong password has 9 or more characters, 1 digit, 1 lowercase, 1 uppercase and 1 symbol. However,
in Gamigo's case, only 1250 passwords are considered strong.

```chart
id: gamigo-strength
type: "split"
note: "Share of cracked passwords"
decimals: 0
data: [["Considered strong", 0], ["Not strong", 100]]
```

This low number of strong passwords is a combination of the fact that the passwords were cracked,
but also because of the missing password policy. A password of 10+ lowercase characters is not
considered secure, and a single symbol in a 10+ character password would exponentially increase the
security of the password.

## Wordlists

17% of the passwords were cracked right away using common wordlists. That is pretty normal on sites
with limited or no password policy.

```chart
id: gamigo-wordlists
type: "split"
title: "Common wordlists"
note: "Share of cracked passwords"
decimals: 0
data: [["In wordlists", 17], ["Not in wordlists", 83]]
```

The IQ Wordlist (more info
[here](/2012/01/building-perfect-wordlist.html)) cracked 20% of the
passwords.

```chart
id: gamigo-iq
type: "split"
title: "IQ wordlist"
note: "Share of cracked passwords"
decimals: 0
data: [["In IQ wordlist", 20], ["Not in IQ wordlist", 80]]
```

## 10 Most Common Passwords

The passwords in this list are the most common passwords used by Gamigo users. Most of them are
numbers only, but a few stand out. 'azerty' is used a lot by French users since they have
[AZERTY](https://en.wikipedia.org/wiki/AZERTY) keyboard layouts (see the email analysis below for
more info on French users). I'm unsure why 'perach' is on the list, it might be the [German
municipality](https://de.wikipedia.org/wiki/Perach) or a password used multiple times by a bot.

| Password   | Frequency |
|------------|-----------|
| 123456     | 35.621    |
| 123456789  | 24.377    |
| czz000     | 6.166     |
| 12345      | 5.300     |
| 111111     | 4.765     |
| azerty     | 4.614     |
| 12345678   | 4.547     |
| perach     | 3.913     |
| 123123     | 3.749     |
| 1234567890 | 3.679     |

## Email Analysis

The leak also contained a large amount of emails. So as an added bonus, I've made an analysis of the
emails.

8.261.454 emails were in the leak and 8.244.423 (99,7%) of them are unique. 79065 of the emails were
invalid according to [RFC 2822](https://www.rfc-editor.org/rfc/rfc2822.txt), that leaves  8.165.358 (99%
of unique) valid emails.

## Domain Statistics

 In the domain statistics, we can see that "hotmail.com" and "hotmail.fr" are the two most used
email providers. This hints at a large percentage of French users.

```chart
id: gamigo-domains
type: "bars"
note: "Share of email addresses by provider"
decimals: 0
max: 30
data: [["hotmail.com", 27], ["hotmail.fr", 15], ["web.de", 14], ["gmail.com", 11], ["gmx.de", 8], ["hotmail.de", 7], ["yahoo.com", 6], ["yahoo.de", 5], ["live.fr", 4], ["o2.pl", 3]]
```

## Top Level Domain Statistics

In the TLD statistics, we can see that 30% of the users of Gamigo were using German email providers.
Gamigo is a German service, so we would have expected that. However, the second-largest country in
the statistics is France.

```chart
id: gamigo-tlds
type: "bars"
note: "Share of email addresses by top-level domain"
decimals: 0
max: 40
data: [[".com", 37], ["Germany", 30], ["France", 17], ["Poland", 6], ["Italy", 3], [".net", 3], ["Spain", 1], ["United Kingdom", 1], ["Austria", 1], ["Russian Federation", 1]]
```

## Email Username as Passwords

A total of 1.399.689 hashes (13%) could be cracked using the username part of the email, as the
password. To maximize the efficiency, I removed dot, underscore and hyphen characters from the
emails. This is a surprisingly large number of hashes cracked using the emails only. Note that I do not
have email and hash pairs, but rather a bunch of emails and a bunch of hashes. Each email username
was tested against all the hashes, so a user with the email john@gmail.com would have resulted in
"john" being tried against all the hashes, resulting in multiple cracked hashes.

```chart
id: gamigo-email-username
type: "split"
note: "Share of cracked hashes"
decimals: 0
data: [["Email username as password", 13], ["Other", 87]]
```

## Conclusion

It seems that Gamigo, like so many other large online services, failed to implement a good password
policy. Not only were they using raw MD5 as the hashing algorithm, but they also had little to no
password strength requirements for their users, which resulted in over 80% of their user hashes
cracked in about a week.

The lesson is that you should implement a stronger hashing algorithm and require some sort of
minimum password strength of your users. Gamigo did force a password reset on all users, but many
users probably just chose the same password or a password that closely resembles the old password.
One good thing came of this, and that is Gamigo took responsibility and told their users of the
hack, this greatly minimizes the damage that can potentially happen to the users.