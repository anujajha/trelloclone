const express = require('express')
var router = express.Router();
const path = require('path');
const fs = require('fs');
const { title } = require('process');


router.get('/api/getCards', (req, res) => {

  const cardsPath = path.join(__dirname, 'board.json');

  fs.readFile(cardsPath, (err, data) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    const cards = JSON.parse(data);
  
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(cards));
  });
});

//self investigate .... form POST
router.post('/api/cards/save/', (req, res, next) => {
  console.log (req.body);
  console.log ('Save API called for card id : ' + req.body.id);
  //console.log (JSON.stringify(req.query));
  //res.setHeader('Content-Type', 'application/json');

  //open the boards.json file
  const cardsPath = path.join(__dirname, 'board.json');

  fs.readFile(cardsPath, (err, data) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    let listId = req.body.listId;
    let cardId = req.body.id;

    const lists = JSON.parse(data);
    // locate the list
    console.log ("Now searching lists for listId: " +listId);
    //console.log(lists)
    let idList = lists.findIndex(l => l.id === listId);

    //console.log (list);

    if (idList > -1) {  // if(idList && idList > -1) doesnt work when index is 0
        //we have found the relevant list at postion idList
        //we simple replace this card in the array of cards
        var listObj = lists[idList];
        let idx = listObj.cards.findIndex(c => c.id === cardId);

        console.log ('we found the card @ position : ' + idx);

        if (idx > -1){
          //card is theer....replace card at this position
          listObj.cards[idx] = {id:cardId, title:req.body.title};
          // //lists[idList] = listObj;
          // fs.writeFile(path.join(__dirname, '/board.json'), JSON.stringify(lists), (err) => { 
          //   if (err) 
          //     console.log(err); 
          //   else { 
          //     console.log("File written successfully\n"); 
          //   } 
          // }); 
          saveCards (lists);
        }else{
          listObj.cards.push({id:cardId, title:req.body.title})
          saveCards (lists);
        }
        
    } else {
        //there exists no list
        // TODO: save (push/append) new list along with cards
        console.log("list doesnt exist. index: " +idList)
        lists.push({id: listId, title: "", cards: [{id:cardId, title:req.body.title}]})
        saveCards(lists);
    }

    function saveCards(lists){
      fs.writeFile(path.join(__dirname, '/board.json'), JSON.stringify(lists), (err) => { 
        if (err) 
          console.log(err); 
        else { 
          console.log("File written successfully\n"); 
        } 
      }); 
    }
  
  //replace the card in the cards array

    res.status(201).json({
        message: 'Thing created successfully!'
      });
      });
})


router.post('/api/listHeader/save/', (req, res, next) => {
  console.log (req.body);
  console.log ('Save API called for list id : ' + req.body.id);

  const listsPath = path.join(__dirname, 'board.json');

  fs.readFile(listsPath, (err, data) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    let listId = req.body.id;

    const lists = JSON.parse(data);
    // locate the list
    console.log ("Now searching lists for listId: " +listId);
    //console.log(lists)
    let idList = lists.findIndex(l => l.id === listId);

    if (idList > -1) {  // if(idList && idList > -1) doesnt work when index is 0
        //we have found the relevant list at postion idList
        //we simple replace this card in the array of cards
        var listObj = lists[idList];
        listObj = {id: listId, title: req.body.title};
        savelistHeader();
        
    } else {
      lists.push({id:listId, title:req.body.title})
      savelistHeader();
    }

    function savelistHeader(lists){
      fs.writeFile(path.join(__dirname, '/board.json'), JSON.stringify(lists), (err) => { 
        if (err) 
          console.log(err); 
        else { 
          console.log("File written successfully\n"); 
        } 
      }); 
    }

    res.status(201).json({
        message: 'Thing created successfully!'
      });
      });
  })


//this function will do the saving of the cards in the database (boards.json for now)
// we have the listId which we use to locate the list first
 // Anuja TODO
/* 
function saveCards (card, listid) {
    users.filter(u => u.email == email);
}
*/
module.exports = router;