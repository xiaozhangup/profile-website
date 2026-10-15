# profile-website

Daniel Zhang / xiaozhangup 的静态个人主页。

- `profile-website/`：可维护的 HTML、CSS、JavaScript 源文件及详细说明。
- `profile-website.html`：生成的单文件版本，可直接用浏览器打开。

## 本地预览

```sh
python -m http.server 8000 --directory profile-website
```

浏览器访问 `http://localhost:8000`。

## 构建单文件版本

```sh
python profile-website/build-standalone.py
```
