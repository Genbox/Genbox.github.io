---
title: "Testing 36,200 DNS servers"
description: "Testing 36,200 DNS servers for response times and reliability, with methodology, comparisons, and benchmark results."
date: "2017-08-12T14:47:00.002Z"
last_modified_at: "2017-08-12T14:47:43.487Z"
permalink: "/2017/08/testing-36200-dns-servers.html"
tags: ["Networking", "Security"]
---

## Introduction

DNS is an important part of the Internet and the speed and security are paramount for a good
browsing experience. I thought it would be a good idea to scan the internet for DNS servers and test
every single one of them. However, the latency of a particular DNS server depends highly on the
distance and connection technology between you and the DNS server, and since I'm geographically
located in Denmark, the results speed-wise only pertain to people located in/around Denmark.

## Testing methodology

I scanned the IPv4 Internet using [NMap](https://nmap.org/) on port 53/UDP and stopped the scan
after a few hours. The results were 36200 DNS servers, some of which are owned by ISPs, companies
and a whole lot of private people. Since the IP scan was randomized, it should represent a good
sample.

Almost all DNS servers have some sort of caching mechanism that makes sure requested DNS names are
kept for as long as the Time-To-Live (TTL) as defined by the domain owner. To ensure we don't just
test a bunch of cached entries, we need to test uncached domains as well.

Reliability is also important, so we need to register when a query is dropped. The drop might be
from a router between us and the DNS server, or it might be the DNS server itself, so we can't
exactly measure the reliability of a particular server, but a high rate of dropped packets will
disqualify nevertheless.

Security is also an important factor, and there are 2 main things to look for:

- [DNSSEC](https://en.wikipedia.org/wiki/Domain_Name_System_Security_Extensions) validation support
- [DNS Spoofing](https://en.wikipedia.org/wiki/DNS_spoofing) hardening

## Popular servers

There are a bunch of "known good" DNS servers out there that have a good reputation for being stable
and fast. I added them to the list, just to make sure we test them as well.

- Google: 8.8.8.8
- OpenDNS: 208.67.222.222
- Level3: 4.2.2.1
- UltraDNS: 156.154.70.1

Note that I did not add secondary clusters for each of the nameservers.

## Performing the test

GRC has a [DNS benchmark tool](https://www.grc.com/dns/benchmark.htm) that accomplishes the cached,
non-cached and reliability tests, but it only supports 200 nameservers at the same time. I split the
list into chunks and used the command line to automate checking 200 servers at a time.

After it finished running, I sorted the lists by average response time and ended up with the 200
fastest DNS servers. I then ran the test again on those servers and ended up with the 10 fastest DNS
servers.

Each of those 10 servers then went through a DNSSEC validation test:

- dig sigok.verteiltesysteme.net @\<DNS IP HERE\>  (should return NOERROR)
- dig sigfail.verteiltesysteme.net @\<DNS IP HERE\> (should return SERVFAIL)

The 10 servers were then subjected to the DNS spoofability test over at [GRC’s DNS
page](https://www.grc.com/dns/dns.htm) to determine the source port and transaction ID entropy.

## Results

The table below is ordered from fastest to slowest based on the average response time.

| IP             | Owner              | DNSSEC validation | Anti-spoof       |
|----------------|--------------------|-------------------|------------------|
| 195.215.95.11  | TDC                | Yes               | Bad              |
| 89.233.43.71   | censurfridns.dk    | Yes               | Bad              |
| 94.126.178.9   | censurfridns.dk    | Yes               | Bad              |
| 94.143.10.52   | dandomain.dk       | No                | Moderate         |
| 147.29.10.6    | sdn.dk             | No                | Moderate         |
| 86.58.175.12   | j.net              | No                | Excellent        |
| 194.239.10.180 | webspeed.dk        | No                | Very bad         |
| 94.143.10.43   | dandomain.dk       | No                | Moderate         |
| 193.219.27.222 | ipweb.dk           | No                | N/A (rate limit) |
| 195.190.31.129 | Welcom Hosting Aps | Yes               | Moderate         |

If we take a look at just the popular DNS servers - as above, ordered by latency relative to my
geographical location.

| IP             | Owner    | DNSSEC validation | Anti-spoof |
|----------------|----------|-------------------|------------|
| 8.8.8.8        | Google   | Yes               | Moderate   |
| 4.2.2.1        | Level3   | No                | Excellent  |
| 208.67.222.222 | OpenDNS  | No                | Excellent  |
| 156.154.70.1   | UltraDNS | Yes               | Excellent  |

## Conclusion

It seems TDC's DNS server is the fastest but unfortunately it has bad anti-spoofing capabilities. It
seems there is no clear winner regarding speed and security. UltraDNS has the best security but was
also the slowest (70% slower than TDC) of the servers in relation to my geographical location. I'm
sure that people located closer to the servers will have lower latency, and then UltraDNS becomes
the clear winner.

In the end, there is little to no difference between the top 10 DNS servers and even the 4 popular
servers. Run a test yourself to see just how big the difference is between your current DNS server
and the popular ones, maybe there is better latency and a little more security to get.