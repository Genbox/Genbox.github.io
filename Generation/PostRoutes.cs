using Blog.Models;
using Blog.Services;
using Microsoft.AspNetCore.Mvc.ApplicationModels;

namespace Blog.Generation;

public sealed class PostRoutes(SiteCatalog site) : IPageRouteModelConvention
{
    public void Apply(PageRouteModel model)
    {
        if (model.ViewEnginePath != "/Post")
            return;

        SelectorModel original = model.Selectors[0];
        model.Selectors.Clear();
        foreach (Post post in site.Posts)
        {
            model.Selectors.Add(new SelectorModel(original)
            {
                AttributeRouteModel = new AttributeRouteModel { Template = post.Url.TrimStart('/') }
            });
        }
    }
}