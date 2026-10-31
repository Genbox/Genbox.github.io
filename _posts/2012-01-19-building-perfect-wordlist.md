---
title: "Building the perfect wordlist"
description: "Building a password wordlist by finding data sources, combining entries, filtering candidates, removing duplicates, and sorting results."
date: "2012-01-19T20:13:00Z"
last_modified_at: "2017-06-15T22:32:47.259Z"
permalink: "/2012/01/building-perfect-wordlist.html"
tags: ["Security"]
---

When it comes to password cracking, the fastest and most effective method is using a wordlist. It is
more flexible than rainbow tables and it is faster than brute force. A good wordlist is key to
cracking a lot of hashes, and that is why it is worth spending some time on building one.

## The Goal

All hashes can be cracked given enough time. Brute forcing 10 million hashes is probably not a good
idea and it is going to take you quite some time to get all of them (read: millions of years), no
matter if it is MD5 or SHA1. Best practice is to brute force passwords of small length and let the
wordlist take the rest. In this blog post, our goal is to get at least 30% coverage in under 1
minute given 30000 hashes. It also has to live up to the following criteria:

1. Target the English language
2. Have words between 6 and 25 characters
3. Contain no words with space (less than 0.3% of passwords contain a space)
4. Contain no symbols-only words (less than 0.02% of passwords contain symbols only)
5. Have no difference in capitalization. Rules take care of capitalization.

## Efficiency

How long does it take to crack the password "Password" using different techniques? It has a length
of 8 and contains upper and lower case characters. Let's use a fast algorithm like MD5.

Hash: **dc647eb65e6711e155375218212b3964**  
Brute force on GPU:1 hour 15 minutes with 1236.6M h/s  
Brute force on CPU: 4 days 2 hours with 292.3M h/s  
Wordlist GPU: \< 1 sec  
Wordlist CPU: \< 1 sec

Note that this is not the actual time it would take to crack the password, but the time it takes to
traverse the full character sets. This was measured on a 4 core 3.4 Ghz i7 and a Geforce GTX 560 TI
using [Hashcat](https://hashcat.net/hashcat/) and [BarsWF](https://3.14.by/en/md5).

## Resources

Building a wordlist is not for the faint-hearted. It requires some knowledge on good data sources,
word frequency, basic algorithms, data manipulation and a powerful computer that can do the heavy
lifting.

## Existing Wordlists

There are tons of wordlists floating around on the Internet. One thing they have in common is that
they are poorly made and filled with garbage. I've seen wordlists containing up to 35% garbage
including non-printable characters, wrong encoding, binary data and more  
That being said, there are good wordlists on the Internet too, and I see no reason why we should not
include them in our own wordlist.

## The Process

This is the battle plan:

1. Find data sources
2. Combine data sources
3. Apply constraints
4. Merge duplicates
5. Sort

## Step 1: Find Data Sources

There are some good wordlists over at [Openwall](https://download.openwall.net/pub/wordlists/). They
also include a wordlist with [John The Ripper](https://openwall.com/john/) that is pretty good. [Cain
and Able](https://oxid.it/en-gb) also has a good wordlist.

[SkullSecurity](https://www.skullsecurity.org/wiki/index.php/Passwords) has done some premium work on
gathering the different wordlists and cleaning leaked passwords for inclusion in wordlists, so I
would highly recommend that you also use his resources.

Then we have the [Oxford University wordlists](ftp://ftp.ox.ac.uk/pub/wordlists/), some small ones
from [outpost9](https://www.outpost9.com/files/WordLists.html) and last, but not least, the
[PacketStormSecurity wordlists](http://packetstormsecurity.org/Crackers/wordlists/).

One can go to the extremes and download
[Wikipedia](https://en.wikipedia.org/wiki/Wikipedia:Database_download) and include that as a data
source. But beware, we are talking many gigabytes of data and it can potentially take a very long
time to process.

## Step 2: Combine Data

This step might sound trivial, but one of the goals is to have a wordlist without spaces. So in this
step, we need to split by spaces so that "John Doe" becomes "John" and "Doe" on each separate line.
Then we combine all the data into one big list.

## Step 3: Apply Constraints

Remove words of a length less than 6 and larger than 25. Brute force will take care of everything
below 6 and we do not target hashes of very long passwords. We also remove all numbers as brute
force can do a better job when it comes to numbers.

Many wordlists contain non-printable characters, uncommon symbols, wrong encoding, binary data and
more. We would like a clean and small wordlist, so it is essential to clean the wordlist. You can
use grep to do this or utilize regular expressions if you are building your own tools.

## Step 4: Merge Duplicates

There is a reason I'm not using the word 'remove' here. To get the most out of our wordlist, we need
to keep track of the frequency of each word in the wordlist. All wordlists contain 'password' and
leaks contain it many times. Keeping track of the frequency of 'password' is essential to step 5,
where we sort the data according to the frequency.

## Step 5: Sort

This is what makes our wordlist efficient. We sort the whole wordlist according to the frequency of
each word and then sort it alphabetically for each frequency. Some algorithms used in cracking are a
bit faster when the passwords are in alphabetical order, and we want every bit of performance
advantage we can get.

The result of this kind of sorting is that we get a list with all the most common passwords first,
and as the passwords start to be more uncommon, they are sorted alphabetically instead.

## Results

I combined a couple of small lists of leaked hashes. I cracked all the passwords made of digits from
1-12 characters in 3 minutes. Then I cracked all 1-5 character passwords with digits, symbols, upper
and lower case in about 20 seconds. A total of 29348 hashes were left in the test hash list.

I did a few runs using popular wordlists on the internet to compare it against the IQ wordlist I
made.

Run \#1 - **Uniq wordlist (334 MB)**  
Time: 19 sec.  
Cracked: 8781 (29.9%)

Run \#2 - **Uniq wordlist with Best64 rules**  
Time: 25 sec.  
Cracked: 10652 (36.2%)

Run \#3 - **Hatelist wordlist (2.64 GB)**  
Time: 32 sec.  
Cracked: 6705 (22.8%)

Run \#4 - **Hatelist wordlist with Best64 rules**  
Time: 1 min, 7 sec.  
Cracked: 8753 (29.8%)

Run \#5 - **IQ wordlist (406 MB)**  
Time: 11 sec.  
Cracked: 10770 (36.7%)

Run \#6 - **IQ wordlist with Best64 rules**  
Time: 17 sec.  
Cracked: 11618 (39.5%)

As we can see, the *IQ wordlist* is a clear winner in terms of speed and efficiency.

## Notes

The hashes that were given are from sites of multiple languages and a high number of computer
specialists. This is what I considered the worst case hashes.