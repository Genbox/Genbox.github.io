---
title: "Windows Phone 7 isolated storage helper"
description: "A C# helper for Windows Phone 7 isolated storage, adding recursive directory deletion and methods for reading and writing lines."
date: "2012-01-12T19:20:00.001Z"
last_modified_at: "2012-01-12T19:27:16.095Z"
permalink: "/2012/01/windows-phone-7-isolated-storage-helper.html"
tags: ["C#"]
---

While working with [isolated
storage](https://windowsphonegeek.com/tips/all-about-wp7-isolated-storage--intro-to-isolated-storage)
on WP7, I faced a lot of problems such as deleting a folder containing files. The default behavior
of the isolated storage is safe, this means it will not delete folders that contain files. I was
also missing the convenience methods
[ReadAllLines()](https://learn.microsoft.com/en-us/dotnet/api/system.io.file.readalllines?view=net-10.0&redirectedfrom=MSDN) and
[WriteAllLines()](https://learn.microsoft.com/en-us/dotnet/api/system.io.file.writealllines?view=net-10.0&redirectedfrom=MSDN) we normally have in the
.NET Framework 4.

I decided to write a small helper that supports this functionality. You can find a description of
each below:

## DeleteDirectoryRecursive()

WP7 isolated storage does not delete folders that contain files. This method finds all subfolders,
deletes files inside the subfolders and then the folder itself.

## ReadAllLines()

Reads all the lines of a file and puts them into a list. This is missing from the
IsolatedStorageFile API

## WriteAllLines()

Writes all the lines of an enumerable collection to a file. If the file does not exist, it will
create it. If the file already exists, it will overwrite the file. Just like ReadAllLines(), it is
just a convenience method that is missing from the IsolatedStorageFile API.

The code can be found on [my
SkyDrive](https://skydrive.live.com/redir.aspx?cid=f116593ba64184a2&resid=F116593BA64184A2%21285&parid=F116593BA64184A2%21210&authkey=%21AFcBJYZnFfWBb2o).