using Blog.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Blog.Pages;

public sealed class IndexModel(SiteCatalog site) : PageModel
{
    public int Number { get; private set; }

    public IActionResult OnGet(int number = 1)
    {
        if (number < 1 || number > site.PageCount)
            return NotFound();
        Number = number;
        ViewData["Title"] = number == 1 ? SiteCatalog.Title : $"Articles, page {number}";
        ViewData["CanonicalPath"] = SiteCatalog.PageUrl(number);
        return Page();
    }
}