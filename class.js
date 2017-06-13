class Class {
  constructor(selectors) {
    this.items = []
    this.max = 0
    this.list = document.querySelector(selectors.listSelector)
    this.template = document.querySelector(selectors.templateSelector)
    document.querySelector(selectors.formSelector).addEventListener('submit', this.addItemViaForm.bind(this))
    const checkboxes = document.querySelectorAll('.checkers')
    for (let i = 0; i < checkboxes.length; i++) {
      checkboxes[i].addEventListener('click', this.filter.bind(this))
    }
    document.querySelector('#search').addEventListener('keyup', this.searchWord.bind(this))
    document.querySelector('.title').addEventListener('click', this.titleSwap.bind(this))
    document.querySelector('.title2').addEventListener('click', this.titleSwap.bind(this))
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
    const listHeader = document.getElementById(item.category + 'H')
    if (listHeader == null) {
      return false
    }
    else {
      if (listHeader.style.display === 'none') {
        listHeader.style.display = 'block'
      }
      const cat = '#' + item.category
      const categorizedList = document.querySelector(cat)
      categorizedList.insertBefore(listItem, categorizedList.firstChild)
      if (item.id > this.max) { // If the new item has an ID greater than the "global" ID
        this.max = item.id + 1
      }
      this.items.unshift(item) // Add new item to array beginning
      this.save() // localStorage
    }
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
    if (this.addItem(item) !== false) {
      form.reset()
      form.childNodes[1].childNodes[3].childNodes[1].textContent = 'Choose a category'
    }
    else {
      console.log('nope')
    }
  }

  filter(ev) {
    ev.target.classList.toggle('isChecked')
    console.log(ev.target.classList)
    const checkboxes = document.querySelectorAll('.checkers')
    const categorizedLists = document.querySelectorAll('.categorList')
    let uncheckedCats = 0

    for (let i = 0; i < checkboxes.length; i++) {
      if (!checkboxes[i].classList.contains('isChecked')) {
        uncheckedCats++
      }
    }
    if (uncheckedCats === checkboxes.length) {
      // None of the boxes have been selected ==> no filter applied
      for (let i = 0; i < categorizedLists.length; i++) {
        const categorizedListItems = categorizedLists[i].childNodes
        console.log(categorizedListItems.length)
        if (categorizedListItems.length > 0) {
          categorizedLists[i].previousElementSibling.style.display = 'block' // previousElementSibline === h2 for respective category
          for (let j = 0; j < categorizedListItems.length; j++) {
            categorizedListItems[j].style.display = 'flex'
          }
        }
        else {
          categorizedLists[i].previousElementSibling.style.display = 'none' // previousElementSibline === h2 for respective category
        }
      }
    }
    else {
      for (let i = 0; i < checkboxes.length; i++) {
        const thisCategory = checkboxes[i].closest('li').textContent
        if (!checkboxes[i].classList.contains('isChecked')) {
          // You have found an unchecked category; thisCategory is unchecked
          for (let j = 0; j < categorizedLists.length; j++) {
            if (categorizedLists[j].id === thisCategory) {
              // You have obtained the ul of the unchecked category
              categorizedLists[j].previousElementSibling.style.display = 'none' // previousElementSibline === h2 for respective category
              const categorizedListItems = categorizedLists[j].childNodes
              for (let k = 0; k < categorizedListItems.length; k++) {
                // Hide all items under the list
                categorizedListItems[k].style.display = 'none'
              }
            }
          }
        }
        else {
          // You have found a checked category; thisCategory is checked
          for (let j = 0; j < categorizedLists.length; j++) {
            if (categorizedLists[j].id === thisCategory) {
              // You have obtained the ul of the checked category
              categorizedLists[j].previousElementSibling.style.display = 'block' // previousElementSibline === h2 for respective category
              const categorizedListItems = categorizedLists[j].childNodes
              for (let k = 0; k < categorizedListItems.length; k++) {
                // Show all items under the list
                categorizedListItems[k].style.display = 'flex'
              }
            }
          }
        }
      }
    }
  }

  searchWord(ev) {
    const currentSearch = ev.target.value.toLowerCase() // text in search bar
    const listItems = document.getElementsByClassName('item') // list item elements
    for (let i = 0; i < this.items.length; i++) { // listItems includes template ==> one too many
      if (!listItems[i].textContent.toLowerCase().includes(currentSearch)) {
        listItems[i].style.display = 'none'
      }
      else {
        listItems[i].style.display = 'flex'
      }
    }
  }

  titleSwap(ev) {
    let otherPic = ev.target.parentElement.nextElementSibling
    if (otherPic === null) {
      otherPic = ev.target.parentElement.previousElementSibling
    }
    ev.target.style.display = 'none'
    console.log(otherPic.childNodes[1].style.display)
    otherPic.childNodes[1].style.display = 'flex'
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