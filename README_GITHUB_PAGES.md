# GitHub Pages Preview

This folder is a preview build for sharing the UNASHI corporate site with team members via GitHub Pages.

## Upload Steps

1. Create a GitHub repository such as `unashi-corporate-preview`.
2. Upload the contents of this folder to the repository root.
   - Upload the files and folders inside this folder, not the folder itself.
3. In the repository, open Settings > Pages.
4. Set the source to deploy from the `main` branch and the root folder.
5. After deployment finishes, share the GitHub Pages URL with the team.

## Preview Notes

- Internal links and assets are converted to relative paths so the site works under a GitHub Pages project URL such as `https://user.github.io/repository-name/`.
- Each HTML file includes `noindex,nofollow`, and `robots.txt` disallows crawling for preview use.
- GitHub Pages URLs are still accessible to anyone who has the URL unless repository/page access is restricted by your GitHub plan and settings.
- The production upload package remains separate from this preview package.
