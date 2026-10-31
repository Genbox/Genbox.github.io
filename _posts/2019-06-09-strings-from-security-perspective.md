---
title: "Strings from a security perspective"
description: "How .NET strings can expose secrets in memory, and the tradeoffs of SecureString, unmanaged memory, and the Data Protection API."
date: "2019-06-09T14:30:00.001Z"
last_modified_at: "2026-10-31T16:14:26Z"
permalink: "/2019/06/strings-from-security-perspective.html"
tags: ["Security", "C#"]
---

There are times when you have to store secrets in your application. You wish to do it securely, but
how exactly would you do that? It is more problematic than you think, and if you don't design your
application around certain concepts, you will end up with a security nightmare that is nearly
impossible to solve.

Let's take a look at an example. Here we are using the popular S3 client from Amazon's official AWS
SDK for .NET:

```csharp
AWSCredentials cred = new BasicAWSCredentials("keyId", "secretAccessKey");
using (AmazonS3Client client = new AmazonS3Client(cred))
{
    //do something with client
}
```

The problem here is that you are forced to enter the secret access key as a string, and strings are
not designed around security best practices. In .NET, strings occupy garbage-collected storage.
Value types such as integers and DateTime can also reside inside managed objects and arrays. It is not the only problem
with strings, but let's take one issue at a time.

## Strings are Garbage (Collected)

When you initialize a string like string myString = "some value" you are actually creating an
object, which is tracked by the garbage collector. This is a nifty feature as you don't have to
free() the string after use. However, it is a double-edged sword when it comes to security. The
string might be kept in memory for a [very long
time,](https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/fundamentals#what-happens-during-a-garbage-collection)
even after it has been used and is not required anymore.

In the example above with S3, if a malicious actor has the ability to look into your application
memory, then he will get hold of the secret access key, and therefore direct access to download
files from your S3 bucket. This is a reoccurring issue for websites that utilize cloud services in
the backend, as access is governed by access control (access keys) alone.

Security bugs that result in remote information disclosure are misused by attackers on a daily
basis, and sometimes a bug like [HeartBleed](https://heartbleed.com/) is discovered, that when
attackers exploit it, millions of applications are suddenly vulnerable to remote memory disclosure.

Languages like Java, C#, VB.net and Go all have a garbage collector, so the issue described in this
section pertains to applications written in any of them.

## It Gets Worse...

The quick-thinking developer might say: "*Just overwrite the string with another value to clear the
secret from memory!*"

```csharp
string myString = null;
```

A fallacious thought, which does not work.

In C#, string literals are typically
[interned](https://en.wikipedia.org/wiki/String_interning); runtime-created strings are generally
separate objects unless explicitly interned. String Interning is great for
performance and reducing memory usage, but it is a nightmare for security. In order to intern
strings, you have to design the string as an [immutable
object](https://en.wikipedia.org/wiki/Immutable_object). Assigning another value or `null` to a
string variable changes the reference; the original object’s characters remain in memory until
that storage is overwritten.

The interned string pool retains references to shared strings, which can keep their contents alive
for the lifetime of the process. Other strings become eligible for collection once unreachable.

## ... Before it Gets Better

So what should we do?

That's simple: **never use strings for secrets**. At least not in garbage collected and string
interned programming languages.

I've seen many different solutions to the problem. Everything from pinning the value in memory and
overwriting it using unmanaged code to scanning the process memory for the string and nuking it.
While some of them might work, it is a lot of hacks and workarounds to a problem that shouldn't
exist in the first place.

Simply do not use strings for secrets, and instead utilize the right tools for the right job. .NET
already has 2 solutions to help us out:

- [SecureString](https://learn.microsoft.com/en-us/dotnet/api/system.security.securestring?view=netframework-4.8)
- [Data Protection
  framework](https://learn.microsoft.com/en-us/aspnet/core/security/data-protection/introduction?view=aspnetcore-2.2)

I have not added AES encryption to the list as you should rely on existing robust data protection
frameworks instead. I'll go into detail on each solution below.

## SecureString

SecureString is the most underutilized feature of .NET. It can provide in-memory encryption of your
application secrets on Windows; protection depends on the platform. It provides low-level
functionality and requires careful handling and disposal. Here is how you create a SecureString:

```csharp
byte[] key = { 115, 101, 99, 114, 101, 116 }; //"secret"
SecureString secure = new SecureString();
foreach (byte b in key)
{
    secure.AppendChar((char)b);
}

secure.MakeReadOnly();
Array.Clear(key, 0, key.Length);
```

No strings in sight! Instead, we use a `byte` array with the content "secret" instead. Since `byte`
arrays are reference types, they are garbage collected and we have to clear the content after use.
They are not interned like strings, so we don't have to worry about any side effects of clearing it.

The call to MakeReadOnly() ensures the SecureString can't be written to after the initialization -
another small security perk we get for free.

Reading a SecureString exposes plaintext temporarily, so keep its lifetime short and release
unmanaged buffers after use. For example:

```csharp
private IEnumerable<char> ReadSecureString(SecureString secure)
{
    IntPtr ptr = IntPtr.Zero;
    try
    {
        ptr = Marshal.SecureStringToGlobalAllocUnicode(secure);
        for (int i = 0; i < secure.Length; i++)
        {
            yield return (char)Marshal.ReadInt16(ptr, i * 2);
        }
    }
    finally
    {
        Marshal.ZeroFreeGlobalAllocUnicode(ptr);
    }
}
```

The iterator exposes plaintext characters and retains an unmanaged plaintext buffer until it is
finished or disposed. Dispose the SecureString itself when you are done with it.

On Windows, SecureString uses operating-system memory protection. Code running in the process can
request the plaintext, so its protection depends on the process and operating-system security.

## The Data Protection framework

Microsoft also provides a NuGet package
called [Microsoft.AspNetCore.DataProtection](https://www.nuget.org/packages/Microsoft.AspNetCore.DataProtection/).
Don't let the AspNetCore section of the name fool you; it can be used by any type of application,
not just ASP.NET Core.

With this framework, you get the ability to protect and unprotect blobs of data, and much like
SecureString above, we can also [use
DPAPI](https://learn.microsoft.com/en-us/aspnet/core/security/data-protection/implementation/key-encryption-at-rest?view=aspnetcore-2.2#windows-dpapi)
as part of the encryption process. However, in this example, I'm going to use plain old key files
instead. Protect access to this directory and configure key encryption at rest for production use.

```csharp
byte[] key = { 115, 101, 99, 114, 101, 116 }; //"secret"
IDataProtectionProvider dpp = DataProtectionProvider.Create(new DirectoryInfo(@"C:\Keys\"));
IDataProtector protector = dpp.CreateProtector("SecretsProtector");
byte[] encrypted = protector.Protect(key);
Array.Clear(key, 0, key.Length);
byte[] notEncrypted = protector.Unprotect(encrypted);
```

The Data Protection framework generates a key file and puts it into
C:\\Keys\\, it then uses that key file to encrypt our key,
which we can then decrypt using the same protector. Since we are not using strings and we are clearing
the original key after encryption, we reduce its plaintext lifetime. Clear `notEncrypted` after use
as well. The persisted key files also need protection through access controls and key encryption.

Microsoft's Data Protection framework has a ton of nice features, including rotating keys,
configurable cryptographic algorithms, Azure Key Vault storage and many more. FIPS compliance
depends on the configured algorithms, providers and deployment. Instead of trying to
build your own secure storage based on AES, use something like Data Protection as a foundation.

## SecureString vs. Data Protection

So when should we use one over the other? That's a hard question, and it really comes down to your
requirements, but I can provide some examples from my own experience.

Use SecureString when...

- You are building a library that accepts SecureString and can handle its plaintext lifetime carefully
- You don't require persistent storage of the secret in a secure format
- You don't need to transmit the secret to someone else

**Update 2019-08-04**: Microsoft recommends alternative approaches for new development because
SecureString’s protection varies across platforms.
See the remark in [the
documentation](https://learn.microsoft.com/en-us/dotnet/api/system.security.securestring?view=netframework-4.8).

Use Data Protection when...

- You are in full control of the application
- You need to store or transmit the encryption keys
- You need configurable encryption that can be evaluated against requirements such as FIPS

SecureString is really just a primitive data type while Data Protection is a full framework, so in
most cases you would probably want to utilize Data Protection for storing secrets securely at-rest
(such as an encrypted config file), and then get a value from that config file as a SecureString in
order to send it to a third-party library. Be sure to use the right tool for the right job.

## But... \[LibraryNameHere\] Requires a String

Yep, and that's the case with almost all libraries, including Amazon’s own S3 client we used as an
example in the beginning. They just don't know how to do it securely, so send them a link to this
article.

The target here is to ensure we only keep the secrets in memory when needed, but always have a way
to get the original secrets if/when needed - just **not** as a string.

If a library requires a secret key as a string, then you have no choice. You have to give it a
string. But please do your part and report it back to the developer.