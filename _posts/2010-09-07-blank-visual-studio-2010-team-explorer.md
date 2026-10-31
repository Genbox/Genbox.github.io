---
title: "Blank Visual Studio 2010 Team Explorer window"
description: "Troubleshooting an empty Team Explorer window after upgrading from Visual Studio 2008 to Visual Studio 2010."
date: "2010-09-07T12:03:00.001Z"
last_modified_at: "2010-09-07T12:03:35.734Z"
permalink: "/2010/09/blank-visual-studio-2010-team-explorer.html"
---

Recently I decided to upgrade my Visual Studio 2008 installation to Visual Studio 2010. I
uninstalled all VS2008 packages and made sure to clean out folders left behind. After a long VS2010
installation I fired up Team Explorer and connected to my Codeplex.com projects; after doing so, I
was met by an empty Team Explorer window.

Several reinstalls later and registry changes I tried reading up on how to repair installations and
came across the command:

devenv /setup

The [setup](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/compiler-options/language#allowunsafeblocks) switch did the trick
and I now have a fully working Team Explorer window.