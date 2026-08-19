export const BOOT = {
  status: '正在游上来',
  enter: '这是个啥',
  retry: '再试一次',
  fail: '游丢了',
}

export const INTRO = {
  lead: '如你所见，我是一条鲶鱼',
  ask: '那我问你……',
  cta: '问呗',
}

export const NEXT_CHAPTER_PASS = {
  lead: '太牛逼了！恭喜！',
  ask: '告诉我你叫什么名字！',
  cta: '就叫这个',
}

export const NEXT_CHAPTER_FAIL = {
  lead: '有点遗憾，差那么一口气，但很感谢你支持',
  ask: '你叫...？',
  cta: '就叫这个',
}

/** @deprecated 填名文案见 NEXT_CHAPTER_PASS / NEXT_CHAPTER_FAIL */
export const NEXT_CHAPTER = NEXT_CHAPTER_FAIL

export const CERT = {
  idLabel: '证书编号',
  honorLine: '全世界最真实的人',
}

export const CERT_PASS = {
  idLabel: '凭证编号',
  honorLine: '典藏版购买权益',
}

export const BRAND = {
  title: 'Buzzy // 鲶鱼',
  gift: ['这里是给 Buzzy', '和喜欢 Buzzy 朋友们的一个小礼物', 'by Oiiii studio'],
}

export const HONOR_PASS = {
  title: '你确实非常了解 Buzzy',
  sub: '解锁了《鲶鱼》典藏版的购买权益',
  save: '保存典藏版购买权益海报',
  deluxe: '典藏版长什么样',
  buy: '去购买典藏版',
  deluxeAlt: '《鲶鱼》典藏版：头套与小鲶鱼',
  buyUrl: 'https://music.163.com/album?id=392637099&uct2=U2FsdGVkX18YBAg4hpy7APtskoH++VKqbaNmLwzTfzU=',
}

export const HONOR_FAIL = {
  title: '现在赠予你「最真实的人」荣誉证书',
  review: '听听《鲶鱼》',
  save: '保存这张证书',
  deluxe: '了解下实体专辑+周边',
  deluxeAlt: '《鲶鱼》典藏版：头套与小鲶鱼',
  albumUrl:
    'https://music.163.com/album?id=392637099&uct2=U2FsdGVkX18YBAg4hpy7APtskoH++VKqbaNmLwzTfzU=',
}

export function honorFailSub(correctCount) {
  return `你回答对了${correctCount}道题，每个人都有自己的观点`
}

export const POSTER = {
  saveHint: '长按图片保存海报',
}

/** @deprecated 分支文案见 HONOR_PASS / HONOR_FAIL */
export const HONOR = HONOR_FAIL

