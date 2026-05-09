class TableOfContents {
	/**
	 * @param {Object} options
	 * @param {string} options.contentId       - ID del contenitore dell'articolo
	 * @param {string} options.tocListId       - ID della lista <ul> della TOC
	 * @param {string} options.tocContainerId  - ID del wrapper della TOC
	 * @param {'h2'|'h2h3'} options.depth     - 'h2' solo titoli h2, 'h2h3' include anche h3
	 * @param {number} options.scrollOffset    - Offset px dallo scroll (default 80)
	 */
	constructor(options = {}) {
		this.contentId = options.contentId ?? "article-content";
		this.tocListId = options.tocListId ?? "toc-list";
		this.tocContainerId = options.tocContainerId ?? "toc-container";
		this.depth = options.depth ?? "h2h3";
		this.scrollOffset = options.scrollOffset ?? 80;

		this.content = document.getElementById(this.contentId);
		this.tocList = document.getElementById(this.tocListId);
		this.tocContainer = document.getElementById(this.tocContainerId);
	}

	_scrollTo(targetId) {
		const target = document.getElementById(targetId);
		if (!target) return;
		const top = target.getBoundingClientRect().top + window.scrollY - this.scrollOffset;
		window.scrollTo({ top, behavior: "smooth" });
	}

	_createLink(heading, isChild = false) {
		const a = document.createElement("a");
		a.href = `#${heading.id}`;
		a.textContent = heading.textContent ?? "";
		a.className = isChild
			? "text-body-secondary toc-link toc-link--h3"
			: "text-body-secondary toc-link toc-link--h2";

		a.addEventListener("click", (e) => {
			e.preventDefault();
			this._scrollTo(heading.id);
		});

		return a;
	}

	_buildH2Only(headings) {
		headings.forEach((h2, index) => {
			if (!h2.id) h2.id = `section-${index + 1}`;

			const li = document.createElement("li");
			li.appendChild(this._createLink(h2));
			this.tocList.appendChild(li);
		});
	}

	_buildH2H3(headings) {
		let h2Index = 0;
		let h3Index = 0;
		let currentLi = null;
		let subList = null;

		headings.forEach((heading) => {
			if (heading.tagName === "H2") {
				h2Index++;
				h3Index = 0;

				if (!heading.id) heading.id = `section-${h2Index}`;

				currentLi = document.createElement("li");
				currentLi.appendChild(this._createLink(heading, false));
				subList = null;
				this.tocList.appendChild(currentLi);

			} else if (heading.tagName === "H3" && currentLi) {
				h3Index++;

				if (!heading.id) heading.id = `section-${h2Index}-${h3Index}`;

				if (!subList) {
					subList = document.createElement("ul");
					subList.className = "toc-sublist";
					currentLi.appendChild(subList);
				}

				const subLi = document.createElement("li");
				subLi.appendChild(this._createLink(heading, true));
				subList.appendChild(subLi);
			}
		});
	}

	init() {
		if (!this.content || !this.tocList || !this.tocContainer) return;

		const selector = this.depth === "h2h3" ? "h2, h3" : "h2";
		const headings = this.content.querySelectorAll(selector);

		if (headings.length === 0) {
			this.tocContainer.style.display = "none";
			return;
		}

		if (this.depth === "h2h3") {
			this._buildH2H3(headings);
		} else {
			this._buildH2Only(headings);
		}
	}
}



class CodeCopyButton {
	/**
	 * @param {Object} options
	 * @param {string} options.selector        - Selettore dei blocchi di codice (default "pre")
	 * @param {string} options.buttonClass     - Classe CSS del bottone (default "copy-button")
	 * @param {string} options.wrapperClass    - Classe CSS del wrapper (default "pre-wrapper")
	 * @param {string} options.buttonHTML      - HTML interno del bottone
	 * @param {string} options.ariaLabel       - Aria label iniziale (default "Copia codice")
	 * @param {string} options.ariaLabelCopied - Aria label dopo la copia (default "Copiato!")
	 * @param {number} options.feedbackMs      - Durata feedback visivo in ms (default 2000)
	 */
	constructor(options = {}) {
		this.selector = options.selector ?? "pre";
		this.buttonClass = options.buttonClass ?? "copy-button";
		this.wrapperClass = options.wrapperClass ?? "pre-wrapper";
		this.buttonHTML = options.buttonHTML ?? '<i class="bi bi-clipboard"></i>';
		this.ariaLabel = options.ariaLabel ?? "Copia codice";
		this.ariaLabelCopied = options.ariaLabelCopied ?? "Copiato!";
		this.feedbackMs = options.feedbackMs ?? 2000;
	}

	async _copyToClipboard(text) {
		if (navigator.clipboard && window.isSecureContext) {
			await navigator.clipboard.writeText(text);
		} else {
			// Fallback per http non-localhost
			const textarea = document.createElement("textarea");
			textarea.value = text;
			textarea.style.cssText = "position:fixed;opacity:0;pointer-events:none";
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand("copy");
			document.body.removeChild(textarea);
		}
	}

	_createButton() {
		const button = document.createElement("button");
		button.innerHTML = this.buttonHTML;
		button.className = this.buttonClass;
		button.setAttribute("aria-label", this.ariaLabel);
		return button;
	}

	_attachClickHandler(button, pre) {
		button.addEventListener("click", async () => {
			const code = pre.querySelector("code")?.innerText ?? pre.innerText;

			try {
				await this._copyToClipboard(code);

				// Feedback visivo
				button.classList.add("copied");
				button.setAttribute("aria-label", this.ariaLabelCopied);
				setTimeout(() => {
					button.classList.remove("copied");
					button.setAttribute("aria-label", this.ariaLabel);
				}, this.feedbackMs);
			} catch (err) {
				console.error("Errore durante la copia:", err);
			}
		});
	}

	_wrapPre(pre, button) {
		const wrapper = document.createElement("div");
		wrapper.className = this.wrapperClass;
		if (pre.parentNode) {
			pre.parentNode.insertBefore(wrapper, pre);
			wrapper.appendChild(pre);
			wrapper.appendChild(button);
		}
	}

	init() {
		document.querySelectorAll(this.selector).forEach((pre) => {
			const button = this._createButton();
			this._attachClickHandler(button, pre);
			this._wrapPre(pre, button);
		});
	}
}





document.addEventListener("DOMContentLoaded", () => {
	const toc = new TableOfContents({
		depth: "h2h3", // ← cambia in "h2" per soli titoli h2
	});
	toc.init();


	const codeCopy = new CodeCopyButton();
	codeCopy.init();
});