// 编译器
// 递归遍历dom树
// 判断节点类型，文本，判断是否插值绑定
// 元素，判断属性是指令或事件，然后递归元素

class Compile {
    constructor(el, vm) {
        // 保存kvue 实例，方便拿值
        this.$vm = vm;
        this.$el = document.querySelector(el)

        console.log(this.$el)
        if (this.$el) {
            // 执行编译
            this.compile(this.$el)
        }
    }

    compile(el) {
        // 遍历el树
        const childNodes = el.childNodes;

        Array.from(childNodes).forEach(node => {
            // 判断是否是元素
            if (this.isElement(node)) {
                // console.log("编译元素" + node.nodeName);
                this.compileElement(node)
            } else if (this.isInter(node)) {
                // console.log("编译插值绑定" + node.textContent)
                this.compileText(node);
            }

            // 递归子节点
            if (node.childNodes && node.childNodes.length > 0) {
                this.compile(node)
            }
        });
    }

    isElement(node) {
        return node.nodeType === 1
    }

    isInter(node) {
        // 首先是文本， 内容 {{xxx}}
        return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent);
    }

    isDirective(attr) {
        return attr.indexOf('k-') === 0
    }

    isEvent(dir) {
        return dir.indexOf('@') === 0
    }

    compileText(node) {
        node.textContent = this.$vm[RegExp.$1]

        this.update(node, RegExp.$1, "text")
    }

    compileElement(node) {
        const nodeAttrs = node.attributes
        Array.from(nodeAttrs).forEach(attr => {
            // 规定： 指定 k-xx定义
            const attrName = attr.name; // k-xx
            const exp = attr.value // oo 

            // 指令处理
            if (this.isDirective(attrName)) {
                const dir = attrName.substring(2); // xx
                // 执行指令
                this[dir] && this[dir](node, exp)
            }

            // 事件处理 @click
            if (this.isEvent(attrName)) {
                const dir = attrName.substring(1) // click
                // 事件监听
                this.eventHandler(node, exp, dir)
            }
        })
    }

    update(node, exp, dir) {
        // 初始化
        const fn = this[dir + "Updater"];
        fn && fn(node, this.$vm[exp])

        // 更新处理
        new Watcher(this.$vm, exp, function (val) {
            fn && fn(node, val)
        })
    }

    textUpdater(node, value) {
        node.textContent = value;
    }

    // k-text
    text(node, exp) {
        this.update(node, exp, "text")
    }

    // k-html
    html(node, exp) {
        this.update(node, exp, "html")
    }

    // k-model
    model(node, exp) {
        // update 完成赋值与更新
        this.update(node, exp, "model")

        // 事件监听
        node.addEventListener('input', e => {
            this.$vm[exp] = e.target.value
        })
    }

    htmlUpdater(node, value) {
        node.innerHTML = value
    }

    modelUpdater(node, value) {
        node.value = value
    }

    eventHandler(node, exp, dir) {
        const fn = this.$vm.$options.methods && this.$vm.$options.methods[exp]
        node.addEventListener(dir, fn.bind(this.$vm))
    }
}
