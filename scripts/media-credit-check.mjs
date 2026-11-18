const normalize=value=>String(value??'').replace(/\s+/g,' ').trim();
export function assertDeclaredMediaCredit(declared,visible){
 const expected=normalize(declared),actual=normalize(visible);
 if(!expected||!actual)throw Error('Article media credit missing');
 if(/shutterstock/i.test(expected+' '+actual))throw Error('Excluded media provider in credit');
 if(actual!==expected)throw Error('Visible media credit differs from the published article record');
 return true;
}
