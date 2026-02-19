import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';
import shushuanItem from './schema/shushuanItem';
import service from './schema/service';
import post from './schema/post';
import projectTask from './schema/projectTask';

export default defineConfig({
    name: 'aeternum-studio',
    title: 'Aeternum | 蒐集庵 Studio',

    projectId: '8jci05f1',
    dataset: 'production',
    basePath: '/studio',

    plugins: [deskTool()],

    schema: {
        types: [shushuanItem, service, post, projectTask],
    },
});
