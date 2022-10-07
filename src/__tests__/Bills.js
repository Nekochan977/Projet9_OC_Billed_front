/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import Bills from "../containers/Bills.js"
import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList.contains("active-icon")).toBe(true)

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
})

//test handleClickNewBill
describe("Given that I'm connected as an employee and on the bills page", ()=>{
  describe("When I click on the 'Nouvelle note de frais' button", ()=>{
    test("Then it should render the NewBill page", ()=>{

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const bills = new Bills({ document, onNavigate, localStorage })
      const handleClick = jest.fn(()=>bills.handleClickNewBill)
      document.body.innerHTML = BillsUI({ bills })

      const buttonNewBill = screen.getByTestId('btn-new-bill')
      buttonNewBill.addEventListener('click', handleClick)
      userEvent.click(buttonNewBill)
      expect(handleClick).toHaveBeenCalled()
      expect(screen.findAllByTitle("Envoyer une note de frais")).toBeTruthy()
    })
  })
})

// test icon-eye

describe("Given that I'm connected as an employee and on the bills page", ()=>{
  describe("When I click on the eye icon", ()=>{
    test("Then the modalFile should open", ()=>{

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const billsContainer = new Bills({ document, onNavigate, localStorage })
      window.onNavigate(ROUTES_PATH.Bills)
      
      document.body.innerHTML = BillsUI({ data: bills})
      const handleClick = jest.fn(()=>billsContainer.handleClickIconEye);
      const iconEye = screen.getAllByTestId('icon-eye');
      iconEye.forEach(icon=>{
        icon.addEventListener('click', handleClick)
        userEvent.click(icon)
      })
      expect(handleClick).toHaveBeenCalledTimes(iconEye.length);   
    })
  })
})