# VUE

这里将做为vue的基础知识模块，主要是一些文档中没有讲得十分清楚的知识点，以及这些知识点的实践

## 生命周期

vue 的生命周期是使用的vue开发人员必须掌握的，出了常规的生命周期钩子的使用，下面介绍比较少的使用方法

### 使用 `hook` 监听实例的生命钩子

对，你没有听错，而且你也没有走错片场，vue2 中也有是可以是用`hook` 的

应用场景： 暂定咱们现在页面有一个要定义一个定时器（interval），比如用于倒计时，为了避免造成失控或多余的定时器，一般会在页面实例销毁的钩子中取消定时器

```javascript
export default {
    data() {
        return {
            timer: null
        }
    },
    mouted() {
        if(!this.timer){
            this.timer = setInterval(() => {
                // do something
            }, 1000)
        }
    },
    computed: {
        // ...
    },
    watch: {
        // ...
    },
    motheds: {
        // ...
    },
    beforeDestroy() {
        clearInterval(this.timer)
    }

}
```

这里就存在着一个问题了，因为`mouted`和 `beforeDestroy` 中间的内容太多，有可能会导致后续的开发维护人员没有注意到这里，或者如果代码过于复杂的时候，不好看懂这里的逻辑，这就让开发人员造成一定阅读成本；

当然，你也可以把 `beforeDestroy` 钩子放到 `mouted` 钩子下，这能能然逻辑更明显一些，但是如果`mouted` 和`beforeDestroy` 钩子中还有其他的逻辑，这样还是不够清晰；

但是如果说在定义这个定时器的时候就做取消定时器的动作，就上下文逻辑就更清晰了， `hook`就能满足这种需求

```javascript
export default {
    data() {
        return {
            timer: null
        }
    },
    mouted() {
        if(!this.timer){
            this.timer = setInterval(() => {
                // do something
            }, 1000)
            // 取消定时器
            this.$once('hook:beforeDestroy': () => {
                clearInterval(this.timer)
            })
        }
    },
    computed: {
        // ...
    },
    watch: {
        // ...
    },
    motheds: {
        // ...
    }

}

```

这样是不是就整洁，清晰许多了；

**在Vue组件中，可以用过$on,$once去监听所有的生命周期钩子函数，如监听组件的updated钩子函数可以写成 this.$on('hook:updated', () => {})**

### 在父组件中监听子组件的生命周期钩子

在使用第三方组件的时候的，如果需要监听组件的数据变化但组件有没有提过相对的自定义事件就可以考虑使用这个。

```javascript
<template>
  <!--通过@hook:updated监听组件的updated生命钩子函数-->
  <!--组件的所有生命周期钩子都可以通过@hook:钩子函数名 来监听触发-->
  <custom-select @hook:updated="$_handleSelectUpdated" />
</template>
<script>
import CustomSelect from '../components/custom-select'
export default {
  components: {
    CustomSelect
  },
  methods: {
    $_handleSelectUpdated() {
      console.log('custom-select组件的updated钩子函数被触发')
    }
  }
}
</script>

```

## 小项目的全局状态管理

首先`vue` 中的 `vuex` 给我们进行项目状态管理事提供极大的便利，但是如果是一个小项目呢，使用`vuex`就显得小题大做的了, 下面介绍一种在小项目中进行全局状态管理的方案；

### Vue.observable

这个方案主要使用的`Vue.observable`这个api进行实现的  

*注： vue 2.6.0 以上版本才可以使用*

我们先来看看官网上的介绍： 

* 用法

让一个对象可响应。Vue 内部会用它来处理 `data` 函数返回的对象。

返回的对象可以直接用于渲染函数和计算属性内，并且会在发生改变时触发相应的更新。也可以作为最小化的跨组件状态存储器，用于简单的场景：

```javascript
const state = Vue.observable({ count: 0 })

const Demo = {
  render(h) {
    return h('button', {
      on: { click: () => { state.count++ }}
    }, `count is: ${state.count}`)
  }
}
```

看得不是很懂是吗？那下来咱们慢慢的来拆分学习一下；

首先， `Vue.observable(obj)` 接收一个**对象**参数，然后这个 *返回的对象可以直接用于渲染函数和计算属性内，并且会在发生改变时触发相应的更新* 其实就是说这个**对象**进过 `observable` 处理后会变成响应式数据。 其实这里最关键的一点就是这个api会将传入的参数变成响应式数据；

还有点懵？没关系，咱们再往下看；

`vuex`中其实比较核心的两点就是：

1. `vuex` 里的 `state` 和 `computed` 都是响应式数据，数据改变了会触发一些相关的Watch 实例
2. `vuex` 里的数据都是通过`mutations` 进行修改的，为避免逻辑不清晰，不能对数据直接进行修改

明白这两点，那咱们来实现一个小型的`vuex`

```javascript
// 创建 store

import Vue from 'vue'

// 通过Vue.observable创建一个可响应的对象
const state = {
    fistName: ''
}

export const store = Vue.observable(state)

// 定义 mutations ,修改属性
export const mutations = {
    setFistName(val) {  
        store.fistName = val
    }
}

// 挂载 commit
store.commit = function(mutation, ...payload) {
    mutations[mutation](...payload)
}
```

看完上面代码是不是就明白了呢？最后要扩展一点小知识点

**在 Vue 2.x 中，被传入的对象会直接被 Vue.observable 改变，所以如这里展示的，它和被返回的对象是同一个对象。在 Vue 3.x 中，则会返回一个可响应的代理，而对源对象直接进行修改仍然是不可响应的。因此，为了向前兼容，我们推荐始终操作使用 Vue.observable 返回的对象，而不是传入源对象。**

这个简单点说就是，在vue2.6+ 中上面的`state` 和 `store` 是同一个对象 `state === store`（有vue2 的响应式实现原因有关）, 你操作那个都行；但在 `vue3` 中，响应式的是用 `proxy` 进行的，`store` 和 `state` 不是用一个对象， 同时 `state` 是不具备响应式的; 所以为你的代码能向前兼容，操作对象时，是用`Vue.observable`的返回值， 即`store` 进行
