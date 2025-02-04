import { promises } from 'fs'
import { join } from 'path'
import { plugins } from '../lib/plugins.js'

let tags = {
	'main': 'Main',
	'internet': 'Internet',
	'downloader': 'Downloader',
	'tools': 'Tools',
	'group': 'Group',
	'owner': 'Owner',
	'advanced': 'Advanced',
	'': 'No Category',
}

const defaultMenu = {
	before: `
	Halo, %name
	lihat selengkapnya untuk daftar command
	%readmore`.trimStart(),
	header: '*%category*',
	uptime: '*%uptime* (%muptime)',
	body: '• %cmd',
	footer: '',
	after: ``,
}

let handler = async (m, { conn, usedPrefix: _p, __dirname }) => {
	const contact = await m.getContact()
	let name = `@${contact.number}`
	
	let _uptime = process.uptime() * 1000;
	let _muptime;
	  if (process.send) {
          process.send('uptime');
         _muptime = await new Promise(resolve => {
         process.once('message', resolve);
         setTimeout(resolve, 1000);
         }) * 1000;
         }
        let muptime = clockString(_muptime);
        let uptime = clockString(_uptime);

	let help = Object.values(plugins).filter(plugin => !plugin.disabled).map(plugin => {
		return {
			help: Array.isArray(plugin.tags) ? plugin.help : [plugin.help],
			tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
			prefix: 'customPrefix' in plugin,
			enabled: !plugin.disabled,
		}
	})
	for (let plugin of help) if (plugin && 'tags' in plugin) for (let tag of plugin.tags) if (!(tag in tags) && tag) tags[tag] = tag
		let _text = [
			defaultMenu.before,
			defaultMenu.uptime,
			...Object.keys(tags).map(tag => {
				return defaultMenu.header.replace(/%category/g, tags[tag]) + '\n' + [
					...help.filter(menu => menu.tags && menu.tags.includes(tag) && menu.help).map(menu => {
						return menu.help.map(help => {
							return defaultMenu.body.replace(/%cmd/g, help)
							.trim()
						}).join('\n')
					}),
					defaultMenu.footer
					].join('\n')
			}),
			defaultMenu.after
			].join('\n')
	let replace = {
		'%': '%',
		name,
		readmore: readMore
	}
	m.reply((_text.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join`|`})`, 'g'), (_, name) => '' + replace[name])).trim(), false, { mentions: [contact] })

}

handler.help = ['menu']
handler.tags = ['main']
handler.command = /^(menu|help|\?)$/i

export default handler

const readMore = (String.fromCharCode(8206)).repeat(4001)

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}
