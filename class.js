class Class {
  constructor(selectors) {
    this.items = []
    this.max = 0
    this.list = document.querySelector(selectors.listSelector)
    this.template = document.querySelector(selectors.templateSelector)
    document.querySelector(selectors.formSelector).addEventListener('submit', this.addItemViaForm.bind(this))
    this.load()
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
    console.log(item)
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
    // listItem.querySelector('button.star').addEventListener('click', this.starItem.bind(this, item))
    // listItem.querySelector('button.move-up').addEventListener('click', this.moveUp.bind(this, item))
    // listItem.querySelector('button.move-down').addEventListener('click', this.moveDown.bind(this, item))
    listItem.querySelector('button.remove').addEventListener('click', this.removeItem.bind(this))

    return listItem
  }

  addItem(item) {
    const listItem = this.renderListItem(item)
    this.list.insertBefore(listItem, this.list.firstChild)
    if (item.id > this.max) {
      this.max = item.id + 1
    }
    this.items.unshift(item)
    this.save()
  }

  addItemViaForm(ev) {
    ev.preventDefault()
    const form = ev.target
    const item = {
      id: this.max + 1,
      name: form.itemName.value,
      star: false,
    }
    this.addItem(item)
    form.reset()
  }

  edit(item, ev) {
    const listItem = ev.target.closest('.item')
    const nameField = listItem.querySelector('.itemName')
    const btn = listItem.querySelector('.edit.button')
    const icon = btn.querySelector('i.fa')
    if (nameField.isContentEditable) {
      nameField.contentEditable = false
      icon.classList.remove('fa-floppy-o')
      icon.classList.add('fa-pencil')
      btn.classList.remove('success')
      item.name = nameField.textContent
      this.save()
    }
    else {
      nameField.contentEditable = true
      nameField.focus()
      icon.classList.remove('fa-pencil')
      icon.classList.add('fa-floppy-o')
      btn.classList.add('success')
    }
  }

  saveOnEnter(item, ev) {
    if (ev.key === "Enter") {
      ev.preventDefault()
      this.edit(item, ev)
    }
  }

  removeItem(ev) {
    const listItem = ev.target.closest('.item')
    for (let i = 0; i < this.items.length; i++) {
      const currentId = this.items[i].id.toString()
      if (listItem.dataset.id === currentId) {
        console.log(i)
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