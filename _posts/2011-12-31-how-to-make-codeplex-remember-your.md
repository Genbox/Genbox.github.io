---
title: "How to make CodePlex remember your password"
description: "Saving CodePlex source-control credentials with Windows Credential Manager to avoid repeated Team Foundation login prompts."
date: "2011-12-31T22:20:00.001Z"
last_modified_at: "2012-02-11T17:48:33.153Z"
permalink: "/2011/12/how-to-make-codeplex-remember-your.html"
---

[Codeplex](https://web.archive.org/web/20120101203418/http://www.codeplex.com:80/) is an open source community site created by Microsoft, and it
is also where I currently host the [Farseer Physics Engine](https://github.com/Genbox/VelcroPhysics)
project. One of the problems I’ve always had with the site is the missing “Remember Password”
checkbox for the Team Foundation source control login. The reason they are missing the feature is
that the client is actually using the credential manager inside Windows. Here is how you make it
remember your password in Windows 7:

1. Click *Start*
2. Click *Control Panel*
3. Click *Credential Manager*
4. Click “*Add a Windows Credential*”
5. Enter the following information:

Internet or network address: **tfs.codeplex.com**  
User name: \<**Your Username Here**\>  
Password: \<**Your Password Here**\>  
Click *OK* and the Team Foundation client should never ask you again.