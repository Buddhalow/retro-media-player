import SPTableDesigner from '/js/controls/tabledesigner.js';
import SPContextMenuElement from "/js/controls/contextmenu.js";

    export default class SPRestTableDesigner extends SPTableDesigner {
        getCellElement(columnIndex, row) {
            let td = null; // document.querySelector('tr[data-uri="' + row.uri + '"] > td[data-column-index="' + columnIndex + '"]');
            if (!td) {
                td = document.createElement('td');
                td.setAttribute('data-column-index', columnIndex);
                td.created = true;
            } else {
                td.created = false;
            }
            td.innerHTML = '&nbsp';
            if (!row) return td;
            let columnId = this.table.columnheaders[columnIndex];

            let obj = row[columnId];
            if (columnId === 'service-enabled') {

                var button = document.createElement('sp-button');
                button.dataset['service'] = row.id;
                button.innerHTML = 'Enable';
                if (localStorage.getItem('service.' + row.id + '.enabled') == 'true') {
                    button.innerHTML = 'Disable';
                }
                button.addEventListener('click', (e) => {
                    if (localStorage.getItem('service.' + e.target.dataset.service + '.enabled') == 'true') {
                        localStorage.setItem('service.' + e.target.dataset.service + '.enabled', 'false');
                    } else {
                        localStorage.setItem('service.' + e.target.dataset.service + '.enabled', 'true')
                    }
                    alert('Restarting');
                    location.reload();
                })
                td.appendChild(button);
            } else if (columnId === 'plugin-enabled') {

                var button = document.createElement('sp-button');
                button.dataset['plugin'] = row.id;
                button.innerHTML = 'Enable';
                if (localStorage.getItem('plugin.' + row.id + '.enabled') == 'true') {
                    button.innerHTML = 'Disable';
                }
                button.addEventListener('click', (e) => {
                    if (localStorage.getItem('plugin.' + e.target.dataset.plugin + '.enabled') == 'true') {
                        localStorage.setItem('plugin.' + e.target.dataset.plugin + '.enabled', 'false');
                    } else {
                        localStorage.setItem('plugin.' + e.target.dataset.plugin + '.enabled', 'true')
                    }
                    alert('Restarting');
                    location.reload();
                })
                td.appendChild(button);
            } else  if (columnId === 'login') {
                let btn = document.createElement('sp-button');
                btn.classList.add('btn');
                btn.innerHTML = _e('Log in');
                btn.setAttribute('data-service', row.id);
                btn.addEventListener('click', (e) => {
                  const service = window.getServiceByDomain(row.id)
                  service.login();
                })
                td.appendChild(btn);
            } else if (columnId === 'new') {
                td.style.width = '3pt';
                td.innerHTML = '&nbsp;';
                for (let k of Object.keys(row)) {
                    if (
                        (row[k] instanceof Date ||  k.indexOf('ed') === k.length - 2)
                    ) {
                        console.log(row[k])
                        const time = moment(row[k]);
                        console.log(time.fromNow());
                        if (time.isAfter(moment())) {
                            td.innerHTML = '<i class="fa fa-circle primary"></i>';

                            break;
                        }
                    }
                }
            } else if (obj instanceof Date || columnId.indexOf('ed') === columnId.length - 2) {
                let time = obj;
                if (!time) {
                    td.innerHTML = '';



                } else {
                    td.innerHTML = '<sp-datetime></sp-datetime>';
                    td.querySelector('sp-datetime').setState(time);
                }
            } else if (obj instanceof Object) {
                console.log(obj);
                if (GlobalViewStack.isLinkValid(obj.uri)) {
                    td.innerHTML = '<sp-link uri="' + obj.uri + '">' + obj.name + '</sp-link>';
                } else {
                    td.innerHTML = obj.name;
                }
                if (obj.roaming) {
                    td.innerHTML = ' <sup class="highlight">R</sup>';
                }
            } else if (!isNaN(obj)) {
                if (obj < 1 && obj > 0.00) {
                    td.innerHTML = '<sp-popularity value="' + obj + '"></sp-popularity>';
                } else {
                    td.innerHTML = obj; //numeral(obj).format('0,0');
                }
            } else {
                if (!!obj)
                td.innerHTML = '<span>' + obj + '</span>';
                let span = td.querySelector('span');
                if (!!span)
                    span.style.pointerEvents = 'none';
                let c = this.table.dataSource.getNumberOfChildren(row);
                if (c > 0) {
                    let dropdown = document.createElement(
                        'span'
                    );
                    dropdown.style.cssFloat = 'right';
                    dropdown.i = document.createElement('i');
                    dropdown.i.setAttribute('class',  'fa fa-arrow-down');
                    dropdown.appendChild(dropdown.i);
                    dropdown.classList.add('btn-small');
                    dropdown.addEventListener('click', (e) => {
                       if ($(td.parentNode).hasClass('open')) {
                            $('[data-parent-id="' + td.parentNode.getAttribute('data-id') + '"]').hide();
                            $('[data-parent-id="' + td.parentNode.getAttribute('data-id') + '"]').removeClass('open');
                            dropdown.querySelector('i').classList.remove('fa-arrow-up');
                            dropdown.querySelector('i').classList.add('fa-arrow-down');
                            $(td.parentNode).removeClass('open');
                            return;
                        }

                        $('[data-parent-id="' + td.parentNode.getAttribute('data-id') + '"]').show();
                        $('[data-parent-id="' + td.parentNode.getAttribute('data-id') + '"]').addClass('open');
                        dropdown.querySelector('i').classList.remove('fa-arrow-down');
                        dropdown.querySelector('i').classList.add('fa-arrow-up');
                        $(td.parentNode).addClass('open');
                    });
                    td.appendChild(dropdown);
                }
            }
            if (td.innerHTML === 'undefined') td.innerHTML = '';
            return td;
        }

        getRowElement(row) {
            let tr = document.querySelector('tr[data-uri="' + row.uri + "']");
            if (!tr) {
                tr = document.createElement('tr');
                tr.created = true;
                tr.setAttribute('data-id', row.id);

                if (!row) return tr;
            } else {
                tr.created = false;
            }
            let negative = this.table.negative;
            let status = parseInt(row.status || row.statusCode || 0);
            tr.setAttribute('data-status', status);
            let effect = row.effect || 0;

            if (status == 0 && (negative || effect < 0)) {
                let cls = negative ? 'error' : 'success-x';
                tr.classList.add(cls);
            }

            if (row.time instanceof Date) {
                let diff = new Date() - row.time.getTime();
                let duration = 1000 * 60 * 60 * 24;
                if (diff < duration) {
                    this.ctd.span = document.createElement('span');
                    this.ctd.span.innerHTML = '&#x25cf;'
                    this.ctd.appendChild(this.ctd.span);
                    this.ctd.span.classList.add('new');
                    this.ctd.span.style.opacity = 1 - (diff / duration * 5);

                }
            }

            if (status >= 0) {
              if (status >= 200 && status <= 299 ) {
                let cls = negative ? 'error' : 'success-x';
                tr.classList.add(cls);
              } else if (status >= 100 && status <= 199) {
                let cls = negative ? 'warning' : 'processing';
                tr.classList.add(cls);

              } else if (status >= 300 && status <= 300) {
                let cls = negative ? 'warning' : 'redirect';
                tr.classList.add(cls);
              } else if (status >= 400 && status <= 600) {
                let cls = negative ? 'success-x' : 'error';

                tr.classList.add(cls);
              }
              if ((status < 200 || status > 299) && 'time' in row && row.time instanceof Date && 'status' in row) {
                    if ((new Date().getTime() - row.time.getTime()) > 1000 * 60 * 60 * 24 * 16) {
                         tr.classList.add('error');
                    }
                }
            }
            console.log(row);
            console.log("DURATION ", row.duration);

            if (row.unavailable || row.duration === 0 || row.duration === '0') {
              tr.classList.remove('error');
              tr.classList.add('error');
            }

            tr.addEventListener('contextmenu', (e) => {

                let menu = SPContextMenuElement.show({x: e.pageX, y: e.pageY}, row, [
                    {
                        label: _('Go to'),
                        onClick(e) {
                            GlobalViewStack.navigate(row.uri)
                            debugger;
                        }
                    },
                    {
                        label: _('-'),
                        onClick(e) {
                            console.log(e);
                            debugger;
                        }
                    },
                    {
                        label: _('Share to'),
                        onClick(e) {
                            console.log(e);
                        },
                        menuItems: [
                            {
                                label: _('Facebook'),
                                onClick: () => {}
                            }
                        ]
                    }
                ])

            })
            return tr;
        }
        getHeaderRow() {
            let tr = document.createElement('tr');
            return tr;
        }
        getColumnElementAt(columnIndex) {
            let th = document.createElement('th');
            let column = this.table.columnheaders[columnIndex];
            th.innerHTML = _e(column);
            th.setAttribute('width', '10');
            return th;
        }

    };
