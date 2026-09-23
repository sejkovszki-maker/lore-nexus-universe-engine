import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const routes=['/#/wiki','/#/wiki/kozmogonia','/#/search','/#/timeline','/#/story','/#/books'];

for(const viewport of [{name:'desktop',width:1440,height:900},{name:'mobile',width:390,height:844}]){
  test(`WCAG critical/serious regressions are blocked on ${viewport.name}`,async({page})=>{
    test.setTimeout(60_000);
    await page.setViewportSize({width:viewport.width,height:viewport.height});
    for(const route of routes){
      await page.goto(route);
      await page.locator('diablo-app').waitFor({state:'visible'});
      const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
      const blocking=results.violations.filter(item=>item.impact==='critical'||item.impact==='serious');
      expect(blocking.map(item=>({id:item.id,impact:item.impact,nodes:item.nodes.length,samples:item.nodes.slice(0,8).map(node=>({target:node.target,summary:node.failureSummary}))})),`${route} ${viewport.name}`).toEqual([]);
    }
  });
}
