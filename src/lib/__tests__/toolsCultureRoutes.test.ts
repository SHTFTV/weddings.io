import {describe, it, expect} from 'vitest';
import {isRedirect} from '@tanstack/react-router';
import {Route} from '../../routes/tools.$culture';

function redirectedTo(culture: string) {
  try {
    const beforeLoad = Route.options.beforeLoad as (context: {params: {culture: string}}) => unknown;
    beforeLoad({params: {culture}});
  } catch (response) {
    expect(isRedirect(response)).toBe(true);
    if (culture !== 'not-a-culture') expect((response as {options: {reloadDocument?: boolean}}).options.reloadDocument).toBe(true);
    return (response as {options: {href: string}}).options.href;
  }
  throw Error('Expected a culture-tool document redirect');
}

describe('public culture-tool document routing', () => {
  it('Western and existing culture URLs reach their matching tool documents', () => {
    expect(redirectedTo('western')).toBe('/tools/western/index.html');
    expect(redirectedTo('traditional')).toBe('/tools/traditional/index.html');
    expect(redirectedTo('mexican')).toBe('/tools/mexican/index.html');
  });
  it('an unknown culture still returns to the tools hub', () => {
    expect(redirectedTo('not-a-culture')).toBe('/tools');
  });
});
