---
title: "FindDupes 1.1 released"
description: "FindDupes 1.1 speeds up duplicate-file detection by grouping files by size before hashing, with installation instructions."
date: "2019-05-18T18:05:00Z"
last_modified_at: "2019-05-18T18:05:25.433Z"
permalink: "/2019/05/finddupes-11-released.html"
tags: ["C#"]
---

I've released a new version of FindDupes. It now groups files by size before hashing, thereby
dramatically speeding up the deduplication process.  
If you have .NET Core installed, you can install the tool by running:

``` bash
dotnet tool install --global FindDupes
```

If you want to look through the code or report any issues, head over
to <https://github.com/Genbox/FindDupes>