---
title: "The problem with network address translation"
description: "How Network Address Translation complicates direct Internet communication, with examples of connectivity problems and alternatives."
date: "2016-12-03T11:41:00.003Z"
last_modified_at: "2016-12-18T01:36:36.492Z"
permalink: "/2016/12/the-problem-with-network-address.html"
tags: ["Networking"]
---

As a technology ideologist, [Network Address
Translation](https://en.wikipedia.org/wiki/Network_address_translation) (NAT) is one of my biggest
concerns when it comes to the future of the Internet. The Internet was built as a communications
tool to facilitate the sharing of information in digital form. It has vastly improved the
communication between humans around the planet and it has been one of the most important inventions
we have ever made.

My concerns are with the fact that NAT is a direct inhibitor of the nature of the Internet, which
goes against everything we want the Internet to be.

## Network Address Translation

The Internet uses routers to route data from network to network, but to do so, we need addresses of
each network. Today we use [Internet Protocol version 4](https://en.wikipedia.org/wiki/IPv4) (IPv4),
which you usually see in dotted format such as 199.181.132.250. In its raw form, IPv4 is a 32 bit (4
bytes) addressing scheme which is able to address 2^32 (4.294.967.296) networks, which was enough
back when the Internet was created in the 1950s, but it is nowhere near enough for the Internet
today. To solve this problem, [Internet Protocol version 6](https://en.wikipedia.org/wiki/Ipv6)
(IPv6) was created, which has 128 bits that give us 2^128
(340.282.366.920.938.463.463.374.607.431.768.211.456) addresses, which should be enough to last us
for a long time.

Routers need a firmware upgrade in order to route 128-bit addresses, and back in the day when IPv6
was devised (1998), routers simply did not have the capacity to route the larger address space. A
quick workaround was to create NAT, which is a simple mechanism to translate one address to another.
With this capability, Internet Service Providers (ISP) began to distribute routers pre-configured
with NAT enabled. They had DHCP enabled on the LAN interface with [non-routed IP
addresses](https://en.wikipedia.org/wiki/Private_network) (192.168.0.0/24), which then got
translated to a routed IP address on the WAN interface. This allowed ISPs to extend the lifetime of
IPv4 and keep using low capacity consumer routers.

That does not sound too bad, right? It is a clever way to circumvent the limitations of IPv4 and
keep using existing hardware which was produced for cheap in large quantities.

## The Problem

A side effect of NAT is that it splits the Internet into many smaller private networks, which can't
communicate directly with each other unless you do [port
forwarding](https://en.wikipedia.org/wiki/Port_forwarding). This side effect has been documented as
a "security feature" ever since it was conceived, as it essentially functions like a simple firewall
between networks.

Remember what the purpose of the Internet was? That's right, to transmit digital information between
machines! NAT completely contradicts the whole purpose of the Internet by segmenting the Internet,
just because we saw NAT as a quick fix to our IPv4 addressing problem. We have become accustomed to
the fact that NAT exists. It has served its purpose, and it is time we move on to IPv6 and make the
Internet work as intended again.

## The Solution

By now you should already know that IPv6 is the solution to the NAT problem, but there is still an
unanswered question: What about the security NAT provides?

Let me counter-question you with this: What is it we are trying to achieve?

I'd agree that the Internet should not just be one big monolithic security boundary, where any
hosted service can be reached by everyone else. That is why we have firewalls, which NAT is not. You
still have a router with two networks, and in order to publish a service from one network to the
other, a firewall will have to allow it. Firewalls are a much more efficient solution to the
security problem than NAT is.  
Let's say we enabled IPv6, what exactly would that mean?

That is the funny part; you are **already** running IPv6! That's right, you are running a
dual-stacked network layer capable of both IPv4 and IPv6, you don't have to do anything. Most
routers are also already dual-stacked, we just have to disable IPv4 and tadaaaa, you are IPv6 only.

For router manufacturers, developers and network engineers it is a **huge** advantage to completely
disable IPv4, which is why many ISPs today are running IPv6-only networks internally. As a
manufacturer or developer, you can remove NAT,
[TURN](https://en.wikipedia.org/wiki/Traversal_Using_Relays_around_NAT),
[STUN](https://en.wikipedia.org/wiki/STUN),
[IGDP](https://en.wikipedia.org/wiki/Internet_Gateway_Device_Protocol) and
[NAT-PMP](https://en.wikipedia.org/wiki/NAT_Port_Mapping_Protocol) from routers and communication
software. Of course, we still need a network control protocol that publishes a service in the
router's firewall, but it is so much more simple now that you don't have to take NAT into account.

## A Real Example

The BitTorrent protocol is one of the most commonly occurring protocols on the Internet. It is a
simple protocol to transmit binary data between clients in an efficient manner using Peer to Peer
(P2P). Clients find each other by using a Tracker or what's known as a [Distributed Hash
Table](https://en.wikipedia.org/wiki/Distributed_hash_table) (DHT). DHT is a simple protocol, but it
is severely limited by NAT, simply by the fact that it works in a very socialistic manner. Each
client in the DHT network has to store a chunk of data for it to work, but since most of them now
sit behind NAT-enabled routers, they can't be reached by the rest of the network, thereby making
the data they contain unreachable by others. This fundamentally destroys the whole concept of a
Distributed Hash Table! All BitTorrent applications have implemented one of the many protocols to
circumvent NAT, but none of them are perfect. If we switched to IPv6 only networks, DHTs can finally
work again, and we would see a massive gain in performance as clients can find each other more
efficiently.

Other P2P protocols like Skype would also work better and would not have to route through a third
party. Back in 2011 when Microsoft bought Skype, they began transitioning the Skype P2P protocol
from a highly distributed node network into a more centralized platform based on [Microsoft
Notification Protocol](https://en.wikipedia.org/wiki/Microsoft_Notification_Protocol) (MSNP). The
centralized protocol works "better" because Microsoft's servers work as a broker between you and
other clients, thereby circumventing NAT. If the clients both have IPv6 and publish the Skype
service in their router firewall, they could reach each other directly, and instantly get a massive
performance and stability gain.

Maybe this is just wishful thinking, but it does seem that the [IPv6
adoption](https://www.google.com/intl/en/ipv6/statistics.html) is gaining speed, which is good news
for the internet as a whole.