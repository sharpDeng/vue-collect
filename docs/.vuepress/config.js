module.exports = {
    title: 'vue汇总',
    description: '这里收集了与vue相关的知识。',
    theme: '@vuepress/theme-default',
    themeConfig: {
        nav: [
            {text: 'Home', link: '/'}
        ],
        sidebar: {
            '/base/': [
                {
                    title: 'vue 基础',
                    path: '/base/',
                    sidebarDepth: 1,
                    children: [
                        '/base/#'
                    ]
                },
                'sourceCode'
            ],
            '/guide/': [
                ''
            ]
        }
    },
    // webpack 配置
    configureWebpack: {
        resolve: {
            alias: {
            '@alias': 'path/to/some/dir'
            }
        }
    },
    Markdown: {
        lineNumbers: true // 是否在每个代码块的左侧显示行号
    }

}

