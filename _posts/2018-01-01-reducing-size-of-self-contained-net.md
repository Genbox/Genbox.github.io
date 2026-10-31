---
title: "Reducing the size of self-contained .NET Core applications"
description: "Reducing self-contained .NET Core application size using trimming, linking, and native compilation, with size comparisons."
date: "2018-01-01T17:47:00Z"
last_modified_at: "2018-01-01T18:08:19.542Z"
permalink: "/2018/01/reducing-size-of-self-contained-net.html"
tags: ["C#", "Performance"]
---

Just for note keeping, I've written down some methods of reducing the size of a .NET Core
application. I thought others could use it as well, so here you go.

## Original Size

First off, let's see how much disk space a
[self-contained](https://learn.microsoft.com/en-us/dotnet/core/deploying/) 'hello world' application
takes up.

\> dotnet new console  
\> dotnet publish -r win-x86 -c release

Size: 53.9 MB - **yuck!**

## Trimming

Microsoft has built [a
tool](https://github.com/dotnet/standard/blob/release/2.0.0/Microsoft.Packaging.Tools.Trimming/docs/trimming.md)
that finds unused assemblies and removes them from the distribution package. This is much needed
since the 'netcoreapp2.0' profile is basically .NET Framework all over again, and it contains a
truckload of assemblies our little 'hello world' application doesn't use.

\> dotnet new console

\> dotnet add package Microsoft.Packaging.Tools.Trimming -v 1.1.0-preview1-25818-01

\> dotnet publish -r win-x86 -c release /p:TrimUnusedDependencies=true

Size: 15.8 MB

Much better! Although, we have only removed unused assemblies - what about unused code?

## Linking

The Mono team over at Xamarin has [built a
linker](https://github.com/dotnet/core/blob/f99c03dc245c7d903047da8149d4e81350bb27b8/samples/linker-instructions.md) that can remove
unused code from assemblies. If you only use List\<T\> from System.Collections.Generic.dll, why have
HashSet\<T\> and all the other classes? This has a huge impact on reflection obviously, so use with
care.

\> dotnet new console

\> dotnet new nuget

Open nuget.config and add \<add key="dotnet-core"
value="https://dotnet.myget.org/F/dotnet-core/api/v3/index.json" /\>

\> dotnet add package ILLink.Tasks -v 0.1.4-preview-981901

\> dotnet publish -r win-x86 -c release

Size: 22.9 MB

Not as good as trimming it seems, but definitely better than doing nothing.

## .NET Native

In the world of C, we have a thing called 'static linking' which means all assemblies get linked
into a single assembly. This is very nice for small applications or deployments that can't rely on
existing assemblies on the system. C# does not have this feature, but with .NET Native we get
something very close.

.NET Native is actually a refactored runtime called CoreRT, which uses RyuJIT to create native
assemblies. Getting it to work is [not as
easy](https://github.com/dotnet/corert/blob/master/Documentation/how-to-build-and-run-ilcompiler-in-console-shell-prompt.md)
as trimming or linking since unfortunately Microsoft only supports UWP as a native platform. .NET
Core is therefore left out in the cold for now.

1. Download [CMake](https://cmake.org/download/) 3.8 or later. I
   choose [cmake-3.10.1-win64-x64.msi](https://cmake.org/files/v3.10/cmake-3.10.1-win64-x64.msi)
2. Make sure you have Visual Studio 2017 with C++ support installed
3. Download the latest successful build. Check [their
   Jenkins](https://ci.dot.net/job/dotnet_corert/job/master/job/debug_windows_nt/lastStableBuild/) for
   commit hash.
4. Unpack the content to `c:\corert\`
5. Open 'x64 Native Tools Command Prompt for VS 2017'
6. Now you should compile .NET Native:

   ```bat
   cd c:\corert
   build.bat release
   ```

   Note that it takes a long time to download missing packages and compile the whole project.
7. Create a new .NET Core project and add .NET Native msbuild targets:

   ```bat
   mkdir c:\test
   cd c:\test
   dotnet new console
   set IlcPath=c:\corert\bin\Windows_NT.x64.Release
   ```
8. Edit test.csproj and add the two lines just before `</Project>`:

   ```xml
   <Import Project="$(MSBuildSDKsPath)\Microsoft.NET.Sdk\Sdk\Sdk.targets" />
   <Import Project="$(IlcPath)\build\Microsoft.NETCore.Native.targets" />
   ```

Then publish the project:

```bat
dotnet publish -r win-x64 -c release
```

Size: 3.95 MB

Wow! Unused assemblies and unused code have been removed and everything is statically compiled into an
executable. Note that I used x64 and not x86 in the .NET Native build, as I'm not sure .NET Native
supports x86 fully yet.

## Bonus: Trim and Link

We can actually use both trimming and linking to reduce the size of the application further. It
seems that the trimmer is better at finding unused assemblies than the linker is, but if we do both
steps, the trimmer will remove assemblies and the linker will remove the dead code from the
remaining assemblies.

Just add both steps together like this:

\> dotnet new console

\> dotnet new nuget

Open nuget.config and add \<add key="dotnet-core"
value="https://dotnet.myget.org/F/dotnet-core/api/v3/index.json" /\>

\> dotnet add package ILLink.Tasks -v 0.1.4-preview-981901

\> dotnet add package Microsoft.Packaging.Tools.Trimming -v 1.1.0-preview1-25818-01

\> dotnet publish -r win-x86 -c release /p:TrimUnusedDependencies=true

Size: 14.9 MB

Final size is pretty much as low as it gets right now without native compilation.

## Conclusion

We can easily reduce the size of a self-contained .NET Core application, we just have to add the right
packages and switches. Microsoft has changed the behaviour of the .NET Core project and publish
system several times now, which has made it pretty difficult to find the right documentation, so
hopefully, this small blog post will sort it out.