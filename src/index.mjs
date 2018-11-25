const headlySelector = "h1,h2,h3,h4,h5,h6";

const isHeadly = elem => !!elem.tagName.match(/h[1-6]/i);

const headlyLevel = headlyElem => Number(headlyElem.tagName[1]);

const hasOnlyOneID = elem =>
  (elem.hasAttribute("id") ? 1 : 0) + elem.querySelectorAll("[id]").length ===
  1;

const hasOnlyOneHeadly = elem =>
  (isHeadly(elem) ? 1 : 0) + elem.querySelectorAll(headlySelector).length === 1;

const idAncestor = elem =>
  elem.parentElement
    ? elem.parentElement.hasAttribute("id")
      ? elem.parentElement
      : idAncestor(elem.parentElement)
    : null;

const headlyID = headlyElem => {
  if (headlyElem.hasAttribute("id")) return headlyElem.getAttribute("id");

  if (hasOnlyOneID(headlyElem))
    return headlyElem.querySelector("[id]").getAttribute("id");

  const anc = idAncestor(headlyElem);
  if (anc && hasOnlyOneHeadly(anc)) return anc.getAttribute("id");

  return null;
};

const getHeaders = () =>
  [].map
    .call(document.querySelectorAll(headlySelector), headly => {
      const id = headlyID(headly);
      return id
        ? { level: headlyLevel(headly), text: headly.textContent, id }
        : null;
    })
    .filter(_ => !!_);

const popup = () => {
  const headers = getHeaders();
  const html = (() => {
    let prevLevel = 1;
    let html = '<ul style="padding-left:2em">';

    for (const { level, text, id } of headers) {
      while (level > prevLevel) {
        html += '<ul style="padding-left:2em">';
        prevLevel++;
      }
      while (level < prevLevel) {
        html += "</ul>";
        prevLevel--;
      }
      html += `<li><a href="#${encodeURIComponent(id)}">${text}</a></li>`;
    }

    while (prevLevel > 0) {
      html += "</ul>";
      prevLevel--;
    }

    return html;
  })();
  const md = headers
    .map(
      ({ level, text, id }) =>
        `${"  ".repeat(level - 1)}- [${text}](#${encodeURIComponent(id)})`
    )
    .join("\n");

  const template = document.createElement("template");
  template.innerHTML = `
  <div style="position:fixed;overflow:auto;top:0;left:0;width:100%;height:100%;background:rgba(255,255,255,.8);z-index:99999">
    ${html}
    <hr>
    <button>Copy Markdown</button>
  </div>
  `;
  const container = template.content.firstElementChild;
  const button = container.querySelector("button");
  container.addEventListener("click", () => {
    container.parentElement.removeChild(container);
  });
  button.addEventListener("click", () => {
    navigator.clipboard.writeText(md);
  });
  document.body.append(container);
};

popup();
