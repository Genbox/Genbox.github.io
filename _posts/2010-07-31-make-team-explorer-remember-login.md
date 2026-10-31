---
title: "Make Team Explorer remember login credentials"
description: "Using Windows Credential Manager to save Team Foundation Server credentials and avoid repeated Team Explorer login prompts."
date: "2010-07-31T15:23:00.001Z"
last_modified_at: "2010-07-31T15:23:35.006Z"
permalink: "/2010/07/make-team-explorer-remember-login.html"
---

When working with Team Explorer in Visual Studio, you might have come across the annoying user login
box that pops up each time you open a Team Foundation Server connected solution. The Team Explorer
development team decided to use the built-in credential vault in Windows instead of using their own
implementation. Here is how you save the credentials inside the Windows 7 credential vault.

1. Open the Control Panel
2. Click on **User Accounts** (Called User Accounts and Family Safety in category view)
3. Click **Manage Your Credentials** to the left (Called Manage Windows Credentials in category
   view)
4. Next to the Windows Credentials category you click the **Add a Windows credential** button.
5. Enter server address, username and password.
6. Click **Ok**

Now the Team Explorer client should remember your password.