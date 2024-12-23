const ELEMENTS = new Set()
const INVISIBLE_ELEMENTS = new Set()

const SHOW_INVISIBLE = false
const LIMIT = Number.MAX_SAFE_INTEGER

async function get_elements() {
    ELEMENTS.clear()

    for (const element of document.body.querySelectorAll('*')) {

        // User option
        if (!SHOW_INVISIBLE && !element.checkVisibility({ opacityProperty: true, visibilityProperty: true, contentVisibilityAuto: true })) {
            INVISIBLE_ELEMENTS.add(element)

            continue
        }

        if (["A", "BUTTON", "SELECT", "SUMMARY", "LABEL", "AREA"].includes(element.tagName) || element.onclick || ["pointer", "text"].includes(window.getComputedStyle(element).cursor)) { ELEMENTS.add(element) }
    }
}

async function search_elements(search_text = '', get_new_elements = true) {
    const search_terms = search_text.toLowerCase().split(' ').filter(term => term)

    const results = []
    const text_results = []
    const outer_html_results = []

    let counter = 0
    // User option
    const limit = LIMIT

    let current_parent_node = null

    for (const element of await get_elements()) {
        // User option?
        const element_html = element.outerHTML.toLowerCase()

        if (search_terms.every(term => element_html.includes(term)) && (!current_parent_node || !current_parent_node.contains(element)) && (SHOW_INVISIBLE || has_invisible_parent(element))) {
            if (counter === limit) { break }
            counter++

            const text = get_element_text(element)

            current_parent_node = element

            if (!text) { continue }

            element.dataset.bonito_run_lable = text
            
            if (search_terms.every(term => text.toLowerCase().includes(term))) { text_results.push(element) }
            else { outer_html_results.push(element) }
        }
    }
    
    results.push(...[...text_results, ...outer_html_results])

    if (results.length === 0 && get_new_elements) {
        get_elements()

        return search_elements(search_text, false)
    }

    return results
}

function has_invisible_parent(parent) {
    while (parent) {
        if (parent in INVISIBLE_ELEMENTS) { return false }

        parent = parent.parentElement
    }

    return true
}

function get_element_text(element) {
    let text = document.getElementById(element.getAttribute('aria-labelledby'))?.innerText || element.ariaLabel || element.alt || element.placeholder || element.title || element.innerText || element.textContent || element.value

    return text?.trim()
}
