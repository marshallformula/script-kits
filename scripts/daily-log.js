/** @type {import("@johnlindquist/kit")} */

// Menu: Daily Log
// Description: Add entries to daily log
// Author: Me
// Twitter: @marshallformula
// Shortcode: l

const { format } = await npm('date-fns')

// Select Vault
const vault = await arg('Choose Vault', [
  {
    name: 'Work',
    value: 'work',
    shortcode: 'w',
  },
  {
    name: 'Marshallformula',
    value: 'marshallformula',
    shortcode: 'm',
  },
])

const today = new Date()
const longDate = format(today, 'yyyy-MM-dd')
const weekday = format(today, 'ccc')
const obsidianDir = await env('OBSIDIAN_DIR')
const todayFile = path.join(obsidianDir, vault, 'daily', `${longDate}.md`)
let firstEntry = true

/**
 * Format the entry with the timestamp prefix
 * if it's the first one of this series
 */
const formatEntry = (entry) => {
  let bulletEntry = entry.trim().startsWith('-') ? entry : `- ${entry}`

  if (firstEntry) {
    firstEntry = false
    return `
\`[${format(today, 'HH:mm')}]\`:
${bulletEntry}\n`
  }

  return `${bulletEntry}\n`
}

/**
 * Write the entry to the file
 */
const addEntry = async (entry) => {
  await appendFile(todayFile, formatEntry(entry))
}

// Create today's file if it doesn't already exist
if (!(await isFile(todayFile))) {
  await writeFile(todayFile, `# ${longDate} | ${weekday}`)
}

// Gather & append all the entries
while (true) {
  let entry = await arg({
    placeholder: 'Entry:',
    hint: 'type "view" to open in obsidian',
  })
  if (entry.trim() === 'view') {
    // required to run an electron app
    // https://github.com/johnlindquist/kit/discussions/314
    delete process.env.ELECTRON_RUN_AS_NODE
    //open obsidian url
    exec(`open obsidian://vault/${vault}/daily/${longDate}.md`)
    exit()
  } else {
    await addEntry(entry)
  }
}
