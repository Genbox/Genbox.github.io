---
title: "The history of gperf"
description: "Tracing the origins of gperf through historical documents and source code, from Perfect and its early authors to the GNU tool."
date: "2025-03-18T21:14:00.003Z"
last_modified_at: "2025-03-18T21:32:26.568Z"
permalink: "/2025/03/the-history-of-gperf.html"
tags: ["Algorithms", "Performance"]
---

In this post I'll document my research into the history of gperf. A copy of the historical documents
and source code referenced in this post can be [found
here](https://github.com/Genbox/gperf-archive).

If you have worked with hashing you have probably used gperf. It is a tool you give a list of
keywords and outputs C/C++ code to look up if a keyword is contained within the list. The lookup
function is incredibly fast and looks like black magic.

In 1979 Richard J. Cichelli wrote an article titled [Minimal Perfect Hash Functions Made
Simple](https://dl.acm.org/doi/10.1145/358808.358813). In January 1980 it was published in
Communications of the ACM, Volume 23, Issue 1. Back then Richard worked as a Research Manager for
American Newspaper Publishers Association Research Institute, but was doing this as part of his own
company [Software Consulting Services
(SCS)](https://www.newspapersystems.com/about-the-founders.html) which he ran with his wife Martha
Cichelli until 2021.

Today, Richard's article is known as *Cichelli's Method* and works by computing a hash based on the
first and last character of the input, as well as the length of the input, then using that hash with
an association table to generate a nearly-minimal perfect hash function. Cichelli describes two
disadvantages in his article:

1. It requires that no two keys share length and the first and last characters
2. For lists with more than about 45 items, segmentation into sublists may be necessary

These limitations will become important in the next paragraph.

In December 1980, Gerhard Jaeschke and G. Osterburg from IBM Scientific Center in Heidelberg, West
Germany published an article in Communications of the ACM, Volume 23, Issue 12 titled [Technical
Response to: On Cichelli's Minimal Perfect Hash Functions
Method](https://dl.acm.org/doi/10.1145/359038.3084011). In the article, they determine that there
exists an infinite number of keywords, on which Cichelli's perfect hash method (noted as Cichelli's
Condition or CD) does not work. As a response to this, Richard adds a third disadvantage:

3.  For certain contrived lists of keys, it may be impossible to determine in advance whether this
    method will yield a minimal solution.

Note: Gerhard Jaeschke has himself published several articles pertaining to minimal perfect hash
functions which are quite interesting, but let's stay on the subject of gperf.

In 1982 Charlie D. Havener wrote a tool called Perfect and in 1983 [posted
it](https://www.tuhs.org/Usenet/comp.sources.unix/1983-October/003584.html) in the Usenet
newsgroup comp.sources.unix. It is based on Cichelli's method, and is the first public
implementation, as the Pascal version written by Richard himself was never published. Charlie notes
that Perfect was used to write a Lexical Analyzer Data Structure and posted in Appendix B in the
article More on Minimal Perfect Hash Tables by Cook, Curtis R. and Oldehoeft, R. R.

Back then Charlie worked with hardware and software design as a [senior principal
engineer](https://ecommons.cornell.edu/bitstream/1813/28000/1/086_08.pdf) at GenRad Inc. in the
component test division in Bolton, Massachusetts. Later in 1988 he [taught computer
science](https://ecommons.cornell.edu/bitstream/1813/28039/1/090_07.pdf) at Boston University.
Unfortunately, Charlie suffered from myelofibrosis (a rare blood cancer) and
[died](https://web.archive.org/web/20250318184140/https://www.legacy.com/us/obituaries/name/charles-havener-obituary?pid=178921677) November
10, 2012.

In 1984 Keith
Bostic [posted](https://www.usenetarchives.com/view.php?id=net.sources&mid=PDQyMzRAc2Vpc21vLlVVQ1A%2B) an
improved version of Charlie's Perfect in the Usenet newsgroup net.sources. He highlights the
limitations of the original implementation as mentioned above. Keith needed to hash more keywords
than what was supported by Perfect, and therefore, rewrote Perfect to support his use case. He notes
the following improvements:

- No limit on the number of keywords
- Much faster
- No need to reorder the keywords
- The ability to specify which keys to hash
- It handles keywords that hash to identical values

Instead of just taking the first and last characters, Keith's version allows the user to specify
which characters to hash.

In January 1989 Douglas C. Schmidt wrote version 1.1 of gperf in C++ while he was at University of
California, Irvine, USA. As mentioned in the
[manual](https://www.gnu.org/software/gperf/manual/gperf.html#Contributors), it was based on Keith's
version of Perfect. In May 1989 Douglas made a C version which was published on comp.sources.unix.

For many years, gperf was part of the libg++ library and the sources can still be found in [old
releases](https://ftp.tsukuba.wide.ad.jp/software/gcc/old-releases/libg++/). The earliest release I
could find was libg++-1.35.1. In August 2000, with the release of version 2.7, it was moved to be a
separate project.