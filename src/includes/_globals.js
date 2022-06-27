import { upperFirst, camelCase } from 'lodash';

export default {
  install(app) {
    // give webpack context for global components directory. Do not search subdirectories.
    // Regex to search for all .vue files
    const baseComponents = require.context('../components/Base', false, /[A-Za-a0-9-_,\s]+\.vue$/i);

    baseComponents.keys().forEach((fileName) => {
      const componentConfig = baseComponents(fileName);

      // Convert name to pascal case. Remove ./ from name. Remove .vue from name
      const componentName = upperFirst(
        camelCase(fileName.replace(/^\.\//, '').replace(/\.\w+$/, '')),
      );

      // export default
      app.component(`Base${componentName}`, componentConfig.default || componentConfig);
    });
  },
};
