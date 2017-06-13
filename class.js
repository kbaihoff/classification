class Class {
  constructor(selectors) {
    this.items = []
    this.max = 0
    this.list = document.querySelector(selectors.listSelector)
    this.template = document.querySelector(selectors.templateSelector)
    document.querySelector(selectors.formSelector).addEventListener('submit', this.addItemViaForm.bind(this))
    // document.querySelectorAll('.checkers').addEventListener('click', this.filter.bind(this))
    // (document.querySelectorAll('.checkers')).map(this.sayhi)
    document.querySelector('#search').addEventListener('keyup', this.searchWord.bind(this))
    this.load()
  }

  sayhi() {
    console.log('hi')
  }

  load() {
    const itemsJSON = localStorage.getItem('itemArray')
    if (itemsJSON != null && itemsJSON != 'undefined') {
      const itemsArray = JSON.parse(itemsJSON)
      if (itemsArray) {
        itemsArray.reverse().map(this.addItem.bind(this))
      }
    }
  }

  save() {
    localStorage.setItem('itemArray', JSON.stringify(this.items))
  }

  renderListItem(item) {
    const listItem = this.template.cloneNode(true)
    listItem.classList.remove('template')
    listItem.dataset.id = item.id
    listItem.querySelector('.itemName').textContent = item.name
    listItem.querySelector('.itemName').setAttribute('title', item.name)
    
    if (item.star) {
      listItem.classList.add('star')
    }

    listItem.querySelector('button.edit').addEventListener('click', this.edit.bind(this, item)) 
    listItem.querySelector('.itemName').addEventListener('keypress', this.saveOnEnter.bind(this, item))
    listItem.querySelector('button.star').addEventListener('click', this.starItem.bind(this, item))
    listItem.querySelector('button.move-up').addEventListener('click', this.moveUp.bind(this, item))
    listItem.querySelector('button.move-down').addEventListener('click', this.moveDown.bind(this, item))
    listItem.querySelector('button.remove').addEventListener('click', this.removeItem.bind(this))

    return listItem
  }

  addItem(item) {
    const listItem = this.renderListItem(item)
    const head = item.category + 'H'
    // console.log(document.getElementById(head))
    const cat = '#' + item.category
    const categorizedList = document.querySelector(cat)
    categorizedList.insertBefore(listItem, categorizedList.firstChild)
    if (item.id > this.max) { // If the new item has an ID greater than the "global" ID
      this.max = item.id + 1
    }
    this.items.unshift(item) // Add new item to array beginning
    this.save() // localStorage
  }

  addItemViaForm(ev) {
    ev.preventDefault()
    const form = ev.target
    const item = {
      id: this.max + 1,
      name: form.itemName.value,
      star: false,
      category: document.querySelector('#ddb').textContent,
    }
    this.addItem(item)
    form.reset()
  }

  filter(ev) {
    const checkedCategory = ev.target.closest('li').textContent
    console.log(checkedCategory)

  }

  searchWord(ev) {
    for (let i = 0; i < this.items.length; i++) {
      const currentSearch = ev.target.value.toLowerCase() // text in search bar
      const listItems = document.getElementsByClassName('item') // list item elements
      const currentListItem = listItems[i]
      if (!currentListItem.textContent.toLowerCase().includes(currentSearch)) {
        currentListItem.style.display = 'none'
      }
      else {
        currentListItem.style.display = 'flex'
      }
    }
  }

  edit(item, ev) {
    const listItem = ev.target.closest('.item')
    const nameField = listItem.querySelector('.itemName')
    const button = listItem.querySelector('.edit.button')
    const icon = button.querySelector('i.fa')
    if (nameField.isContentEditable) { // It currently editable
      nameField.contentEditable = false
      icon.classList.remove('fa-floppy-o')
      icon.classList.add('fa-pencil')
      button.classList.remove('success')
      item.name = nameField.textContent
      this.save()
    }
    else { // If not currently editable
      nameField.contentEditable = true
      nameField.focus()
      icon.classList.remove('fa-pencil')
      icon.classList.add('fa-floppy-o')
      button.classList.add('success')
    }
  }

  saveOnEnter(item, ev) {
    if (ev.key === "Enter") {
      ev.preventDefault()
      this.edit(item, ev)
    }
  }

  starItem(item, ev) {
    const listItem = ev.target.closest('.item')
    listItem.classList.toggle('star')
    item.star = !item.star
    this.save()
  }

  moveUp(item, ev) {
    const listItem = ev.target.closest('.item')
    // console.log(listItem)
    const index = this.items.findIndex((current, i) => {
      return (current.id === item.id)
    })
    if (index > 0) {
      const cat = '#' + item.category
      const categorizedList = document.querySelector(cat)
      categorizedList.insertBefore(listItem, listItem.previousElementSibling)
      const prev = this.items[index - 1]
      this.items[index - 1] = item
      this.items[index] = prev
      this.save()
    }
  }

  moveDown(item, ev) {
    const listItem = ev.target.closest('.item')
    const index = this.items.findIndex((current, i) => {
      return (current.id === item.id)
    })
    if (index < this.items.length - 1) {
      const cat = '#' + item.category
      const categorizedList = document.querySelector(cat)
      categorizedList.insertBefore(listItem.nextElementSibling, listItem)
      const next = this.items[index + 1]
      this.items[index + 1] = item
      this.items[index] = next
      this.save()
    }
  }

  removeItem(ev) {
    const listItem = ev.target.closest('.item')
    for (let i = 0; i < this.items.length; i++) {
      const currentId = this.items[i].id.toString()
      if (listItem.dataset.id === currentId) {
        this.items.splice(i, 1)
        break
      }
    }
    listItem.remove()
    this.save()
  }
}

const app = new Class({
  formSelector: '#input-form',
  listSelector: '#item-list',
  templateSelector: '.item.template',
})