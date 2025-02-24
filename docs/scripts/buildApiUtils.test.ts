import path from 'path';
import fs from 'fs';
import { expect } from 'chai';
import sinon from 'sinon';
import FEATURE_TOGGLE from '../src/featureToggle';
import {
  extractApiPage,
  extractPackageFile,
  getGenericComponentInfo,
  getMaterialComponentInfo,
  getBaseComponentInfo,
} from './buildApiUtils';

describe('buildApiUtils', () => {
  describe('extractApiPage', () => {
    it('return info for api page', () => {
      expect(
        extractApiPage('/material-ui/docs/pages/material-ui/api/accordion-actions.js'),
      ).to.deep.equal({
        apiPathname: '/material-ui/api/accordion-actions',
      });
    });
  });

  describe('extractPackageFilePath', () => {
    it('return info if path is a package (material)', () => {
      const result = extractPackageFile('/material-ui/packages/mui-material/src/Button/Button.js');
      sinon.assert.match(result, {
        packagePath: 'mui-material',
        muiPackage: 'mui-material',
        name: 'Button',
      });
    });

    it('return info if path is a package (lab)', () => {
      const result = extractPackageFile(
        '/material-ui/packages/mui-lab/src/LoadingButton/LoadingButton.js',
      );
      sinon.assert.match(result, {
        packagePath: 'mui-lab',
        muiPackage: 'mui-lab',
        name: 'LoadingButton',
      });
    });

    it('return info if path is a package (base)', () => {
      const result = extractPackageFile(
        '/material-ui/packages/mui-base/src/TabUnstyled/TabUnstyled.tsx',
      );
      sinon.assert.match(result, {
        packagePath: 'mui-base',
        muiPackage: 'mui-base',
        name: 'TabUnstyled',
      });
    });

    it('return info if path is a package (data-grid)', () => {
      const result = extractPackageFile('/material-ui/packages/grid/x-data-grid/src/DataGrid.tsx');
      sinon.assert.match(result, {
        packagePath: 'x-data-grid',
        muiPackage: 'mui-data-grid',
        name: 'DataGrid',
      });
    });

    it('return info if path is a package (data-grid-pro)', () => {
      const result = extractPackageFile(
        '/material-ui/packages/grid/x-data-grid-pro/src/DataGridPro.tsx',
      );
      sinon.assert.match(result, {
        packagePath: 'x-data-grid-pro',
        muiPackage: 'mui-data-grid-pro',
        name: 'DataGridPro',
      });
    });

    it('return null if path is not a package', () => {
      const result = extractPackageFile(
        '/material-ui/docs/pages/material/getting-started/getting-started.md',
      );
      sinon.assert.match(result, {
        packagePath: null,
        name: null,
      });
    });
  });

  describe('getGenericComponentInfo', () => {
    it('return correct apiPathname', () => {
      const info = getGenericComponentInfo(
        path.join(process.cwd(), `/packages/mui-material/src/Button/Button.js`),
      );
      sinon.assert.match(info, {
        name: 'Button',
        apiPathname: '/api/button/',
        muiName: 'MuiButton',
        apiPagesDirectory: sinon.match((value) =>
          value.endsWith(`docs${path.sep}pages${path.sep}api-docs`),
        ),
      });

      expect(info.getInheritance('ButtonBase')).to.deep.equal({
        name: 'ButtonBase',
        apiPathname: '/api/button-base/',
      });

      expect(info.getDemos()).to.deep.equal([
        {
          name: 'Button Group',
          demoPathname: '/components/button-group/',
        },
        {
          name: 'Buttons',
          demoPathname: '/components/buttons/',
        },
      ]);
    });

    it('Icon return correct Demos annotation', () => {
      const info = getGenericComponentInfo(
        path.join(process.cwd(), `/packages/mui-material/src/Icon/Icon.js`),
      );
      sinon.assert.match(info, {
        name: 'Icon',
        apiPathname: '/api/icon/',
        muiName: 'MuiIcon',
        apiPagesDirectory: sinon.match((value) =>
          value.endsWith(`docs${path.sep}pages${path.sep}api-docs`),
        ),
      });

      expect(info.getDemos()).to.deep.equal([
        {
          name: 'Icons',
          demoPathname: '/components/icons/',
        },
        {
          name: 'Material Icons',
          demoPathname: '/components/material-icons/',
        },
      ]);
    });
  });

  describe('getMaterialComponentInfo', () => {
    beforeEach(function test() {
      if (!FEATURE_TOGGLE.enable_product_scope) {
        this.skip();
      }
    });
    it('return correct info for material component file', () => {
      const info = getMaterialComponentInfo(
        path.join(process.cwd(), `/packages/mui-material/src/Button/Button.js`),
      );
      sinon.assert.match(info, {
        name: 'Button',
        apiPathname: '/material-ui/api/button/',
        muiName: 'MuiButton',
        apiPagesDirectory: sinon.match((value) =>
          value.endsWith(path.join('docs', 'pages', 'material-ui', 'api')),
        ),
      });

      expect(info.getInheritance('ButtonBase')).to.deep.equal({
        name: 'ButtonBase',
        apiPathname: '/material-ui/api/button-base/',
      });

      let existed = false;
      try {
        fs.readdirSync(path.join(process.cwd(), 'docs/data'));
        existed = true;
        // eslint-disable-next-line no-empty
      } catch (error) {}
      if (existed) {
        expect(info.getDemos()).to.deep.equal([
          {
            name: 'Button Group',
            demoPathname: '/material-ui/react-button-group/',
          },
          {
            name: 'Buttons',
            demoPathname: '/material-ui/react-button/',
          },
        ]);
      }
    });
  });

  describe('getBaseComponentInfo', () => {
    beforeEach(function test() {
      if (!FEATURE_TOGGLE.enable_product_scope) {
        this.skip();
      }
    });
    it('return correct info for base component file', () => {
      const info = getBaseComponentInfo(
        path.join(process.cwd(), `/packages/mui-base/src/ButtonUnstyled/ButtonUnstyled.tsx`),
      );
      sinon.assert.match(info, {
        name: 'ButtonUnstyled',
        apiPathname: '/base/api/button-unstyled/',
        muiName: 'MuiButton',
        apiPagesDirectory: sinon.match((value) =>
          value.endsWith(path.join('docs', 'pages', 'base', 'api')),
        ),
      });

      info.readFile();

      expect(info.getInheritance()).to.deep.equal(null);

      let existed = false;
      try {
        fs.readdirSync(path.join(process.cwd(), 'docs/data'));
        existed = true;
        // eslint-disable-next-line no-empty
      } catch (error) {}
      if (existed) {
        expect(info.getDemos()).to.deep.equal([
          {
            name: 'Buttons',
            demoPathname: '/material-ui/react-button/',
          },
        ]);
      }
    });
  });
});
